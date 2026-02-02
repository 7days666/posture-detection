/**
 * 积分计算服务
 * 实现积分奖励制度的核心业务逻辑
 * 
 * Requirements:
 * - 1.1: 用户完成当月首次检测时，根据连续月数计算积分（第n个月获得10×n积分）
 * - 1.2: 同一月份重复检测不累加积分
 * - 1.3: 检测完成后立即更新积分余额
 * - 1.4: 记录每次积分变动的详细信息（类型、数量、时间、关联检测记录）
 */

import {
  UserPoints,
  PointsLog,
  UserPointsRow,
  PointsLogRow,
  toUserPoints,
  toPointsLog,
  PointsChangeType,
} from '../types/points';

/**
 * 获取当前月份字符串 (YYYY-MM 格式)
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 检查两个月份是否连续
 * @param previousMonth 前一个月份 (YYYY-MM)
 * @param currentMonth 当前月份 (YYYY-MM)
 * @returns 是否连续
 */
export function areMonthsConsecutive(previousMonth: string, currentMonth: string): boolean {
  const [prevYear, prevMonth] = previousMonth.split('-').map(Number);
  const [currYear, currMonth] = currentMonth.split('-').map(Number);
  
  // 计算月份差
  const prevTotalMonths = prevYear * 12 + prevMonth;
  const currTotalMonths = currYear * 12 + currMonth;
  
  return currTotalMonths - prevTotalMonths === 1;
}

/**
 * 计算积分
 * Requirement 1.1: 第n个月获得10×n积分
 * @param consecutiveMonths 连续检测月数
 * @returns 应获得的积分数
 */
export function calculatePoints(consecutiveMonths: number): number {
  // 连续月数必须为正整数
  if (consecutiveMonths < 1) {
    return 10; // 最少获得10积分（第1个月）
  }
  return 10 * consecutiveMonths;
}

/**
 * 获取用户积分信息
 * @param db D1Database 实例
 * @param userId 用户ID
 * @returns 用户积分信息，如果不存在则返回 null
 */
export async function getUserPoints(
  db: D1Database,
  userId: number
): Promise<UserPoints | null> {
  const row = await db.prepare(`
    SELECT * FROM user_points WHERE user_id = ?
  `).bind(userId).first<UserPointsRow>();
  
  if (!row) {
    return null;
  }
  
  return toUserPoints(row);
}

/**
 * 初始化用户积分记录
 * @param db D1Database 实例
 * @param userId 用户ID
 * @returns 新创建的用户积分信息
 */
export async function initializeUserPoints(
  db: D1Database,
  userId: number
): Promise<UserPoints> {
  await db.prepare(`
    INSERT INTO user_points (user_id, balance, total_earned, total_spent, consecutive_months)
    VALUES (?, 0, 0, 0, 0)
  `).bind(userId).run();
  
  const row = await db.prepare(`
    SELECT * FROM user_points WHERE user_id = ?
  `).bind(userId).first<UserPointsRow>();
  
  if (!row) {
    throw new Error('Failed to initialize user points');
  }
  
  return toUserPoints(row);
}

/**
 * 获取或创建用户积分记录
 * @param db D1Database 实例
 * @param userId 用户ID
 * @returns 用户积分信息
 */
export async function getOrCreateUserPoints(
  db: D1Database,
  userId: number
): Promise<UserPoints> {
  const existing = await getUserPoints(db, userId);
  if (existing) {
    return existing;
  }
  return initializeUserPoints(db, userId);
}

/**
 * 记录积分变动日志
 * Requirement 1.4: 记录每次积分变动的详细信息
 * @param db D1Database 实例
 * @param params 日志参数
 * @returns 创建的日志记录
 */
export async function createPointsLog(
  db: D1Database,
  params: {
    userId: number;
    changeType: PointsChangeType;
    changeAmount: number;
    balanceAfter: number;
    referenceId?: number | null;
    referenceType?: string | null;
    description?: string | null;
    operatorId?: number | null;
  }
): Promise<PointsLog> {
  await db.prepare(`
    INSERT INTO points_logs (
      user_id, change_type, change_amount, balance_after,
      reference_id, reference_type, description, operator_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    params.userId,
    params.changeType,
    params.changeAmount,
    params.balanceAfter,
    params.referenceId ?? null,
    params.referenceType ?? null,
    params.description ?? null,
    params.operatorId ?? null
  ).run();
  
  // 获取刚插入的记录
  const row = await db.prepare(`
    SELECT * FROM points_logs 
    WHERE user_id = ? 
    ORDER BY id DESC 
    LIMIT 1
  `).bind(params.userId).first<PointsLogRow>();
  
  if (!row) {
    throw new Error('Failed to create points log');
  }
  
  return toPointsLog(row);
}

/**
 * 检测完成后添加积分
 * 
 * Requirements:
 * - 1.1: 根据连续月数计算积分（第n个月获得10×n积分）
 * - 1.2: 同一月份重复检测不累加积分
 * - 1.3: 检测完成后立即更新积分余额
 * - 1.4: 记录积分变动详细信息
 * 
 * @param db D1Database 实例
 * @param userId 用户ID
 * @param assessmentId 检测记录ID
 * @returns 积分变动结果，包含是否成功、获得的积分数、更新后的用户积分信息
 */
export async function addPointsForDetection(
  db: D1Database,
  userId: number,
  assessmentId: number
): Promise<{
  success: boolean;
  pointsEarned: number;
  alreadyDetectedThisMonth: boolean;
  userPoints: UserPoints;
  log?: PointsLog;
}> {
  // 获取或创建用户积分记录
  let userPoints = await getOrCreateUserPoints(db, userId);
  const currentMonth = getCurrentMonth();
  
  // Requirement 1.2: 检查是否已在本月检测过
  if (userPoints.lastDetectionMonth === currentMonth) {
    return {
      success: false,
      pointsEarned: 0,
      alreadyDetectedThisMonth: true,
      userPoints,
    };
  }
  
  // 计算新的连续月数
  let newConsecutiveMonths: number;
  let newStreakStartMonth: string;
  
  if (userPoints.lastDetectionMonth === null) {
    // 首次检测
    newConsecutiveMonths = 1;
    newStreakStartMonth = currentMonth;
  } else if (areMonthsConsecutive(userPoints.lastDetectionMonth, currentMonth)) {
    // 连续检测
    newConsecutiveMonths = userPoints.consecutiveMonths + 1;
    newStreakStartMonth = userPoints.streakStartMonth || currentMonth;
  } else {
    // 连续中断，重新开始
    newConsecutiveMonths = 1;
    newStreakStartMonth = currentMonth;
  }
  
  // Requirement 1.1: 计算积分
  const pointsEarned = calculatePoints(newConsecutiveMonths);
  const newBalance = userPoints.balance + pointsEarned;
  const newTotalEarned = userPoints.totalEarned + pointsEarned;
  
  // Requirement 1.3: 立即更新积分余额
  await db.prepare(`
    UPDATE user_points SET
      balance = ?,
      total_earned = ?,
      consecutive_months = ?,
      last_detection_month = ?,
      streak_start_month = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(
    newBalance,
    newTotalEarned,
    newConsecutiveMonths,
    currentMonth,
    newStreakStartMonth,
    userId
  ).run();
  
  // Requirement 1.4: 记录积分变动日志
  const log = await createPointsLog(db, {
    userId,
    changeType: 'detection',
    changeAmount: pointsEarned,
    balanceAfter: newBalance,
    referenceId: assessmentId,
    referenceType: 'posture_assessment',
    description: `第${newConsecutiveMonths}个月连续检测奖励`,
  });
  
  // 获取更新后的用户积分信息
  const updatedUserPoints = await getUserPoints(db, userId);
  if (!updatedUserPoints) {
    throw new Error('Failed to get updated user points');
  }
  
  return {
    success: true,
    pointsEarned,
    alreadyDetectedThisMonth: false,
    userPoints: updatedUserPoints,
    log,
  };
}

/**
 * 获取用户积分变动历史
 * @param db D1Database 实例
 * @param userId 用户ID
 * @param limit 返回记录数量限制
 * @param offset 偏移量
 * @returns 积分变动日志列表
 */
export async function getPointsHistory(
  db: D1Database,
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ logs: PointsLog[]; total: number }> {
  const results = await db.prepare(`
    SELECT * FROM points_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(userId, limit, offset).all<PointsLogRow>();
  
  const countResult = await db.prepare(`
    SELECT COUNT(*) as total FROM points_logs WHERE user_id = ?
  `).bind(userId).first<{ total: number }>();
  
  return {
    logs: results.results.map(toPointsLog),
    total: countResult?.total || 0,
  };
}
