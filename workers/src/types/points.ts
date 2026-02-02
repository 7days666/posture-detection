/**
 * 积分奖励制度类型定义
 * Requirements: 10.4
 */

// 积分变动类型
export type PointsChangeType = 'detection' | 'makeup' | 'redeem' | 'admin_adjust';

// 兑换订单状态
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

// 补测申请状态
export type MakeupRequestStatus = 'pending' | 'approved' | 'rejected';

// 用户积分信息
export interface UserPoints {
  id: number;
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  consecutiveMonths: number;
  lastDetectionMonth: string | null;
  streakStartMonth: string | null;
  createdAt: string;
  updatedAt: string;
}

// 积分变动日志
export interface PointsLog {
  id: number;
  userId: number;
  changeType: PointsChangeType;
  changeAmount: number;
  balanceAfter: number;
  referenceId: number | null;
  referenceType: string | null;
  description: string | null;
  operatorId: number | null;
  createdAt: string;
}

// 商品
export interface Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsRequired: number;
  minConsecutiveMonths: number;
  stock: number;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 收货信息
export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

// 兑换订单
export interface RedemptionOrder {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  pointsSpent: number;
  quantity: number;
  status: OrderStatus;
  shippingInfo: ShippingInfo | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// 补测申请
export interface MakeupRequest {
  id: number;
  userId: number;
  targetMonth: string;
  status: MakeupRequestStatus;
  assessmentId: number | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
}

// 积分概览（API响应用）
export interface PointsSummary {
  balance: number;
  consecutiveMonths: number;
  nextReward: number;  // 下次检测可获得的积分
  canRedeem: boolean;  // 是否满足兑换条件（连续月数>=3）
  totalEarned: number;
  totalSpent: number;
}

// =====================================================
// 数据库行类型（用于从D1查询结果映射）
// =====================================================

// 用户积分表行
export interface UserPointsRow {
  id: number;
  user_id: number;
  balance: number;
  total_earned: number;
  total_spent: number;
  consecutive_months: number;
  last_detection_month: string | null;
  streak_start_month: string | null;
  created_at: string;
  updated_at: string;
}

// 积分变动日志表行
export interface PointsLogRow {
  id: number;
  user_id: number;
  change_type: string;
  change_amount: number;
  balance_after: number;
  reference_id: number | null;
  reference_type: string | null;
  description: string | null;
  operator_id: number | null;
  created_at: string;
}

// 商品表行
export interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  points_required: number;
  min_consecutive_months: number;
  stock: number;
  category: string | null;
  is_active: number;  // SQLite uses 0/1 for boolean
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 兑换订单表行
export interface RedemptionOrderRow {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  points_spent: number;
  quantity: number;
  status: string;
  shipping_info: string | null;  // JSON string
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// 补测申请表行
export interface MakeupRequestRow {
  id: number;
  user_id: number;
  target_month: string;
  status: string;
  assessment_id: number | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  created_at: string;
}

// =====================================================
// 类型转换工具函数
// =====================================================

/**
 * 将数据库行转换为 UserPoints 接口
 */
export function toUserPoints(row: UserPointsRow): UserPoints {
  return {
    id: row.id,
    userId: row.user_id,
    balance: row.balance,
    totalEarned: row.total_earned,
    totalSpent: row.total_spent,
    consecutiveMonths: row.consecutive_months,
    lastDetectionMonth: row.last_detection_month,
    streakStartMonth: row.streak_start_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 将数据库行转换为 PointsLog 接口
 */
export function toPointsLog(row: PointsLogRow): PointsLog {
  return {
    id: row.id,
    userId: row.user_id,
    changeType: row.change_type as PointsChangeType,
    changeAmount: row.change_amount,
    balanceAfter: row.balance_after,
    referenceId: row.reference_id,
    referenceType: row.reference_type,
    description: row.description,
    operatorId: row.operator_id,
    createdAt: row.created_at,
  };
}

/**
 * 将数据库行转换为 Product 接口
 */
export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    pointsRequired: row.points_required,
    minConsecutiveMonths: row.min_consecutive_months,
    stock: row.stock,
    category: row.category,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 将数据库行转换为 RedemptionOrder 接口
 */
export function toRedemptionOrder(row: RedemptionOrderRow): RedemptionOrder {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.product_name,
    pointsSpent: row.points_spent,
    quantity: row.quantity,
    status: row.status as OrderStatus,
    shippingInfo: row.shipping_info ? JSON.parse(row.shipping_info) : null,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 将数据库行转换为 MakeupRequest 接口
 */
export function toMakeupRequest(row: MakeupRequestRow): MakeupRequest {
  return {
    id: row.id,
    userId: row.user_id,
    targetMonth: row.target_month,
    status: row.status as MakeupRequestStatus,
    assessmentId: row.assessment_id,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectReason: row.reject_reason,
    createdAt: row.created_at,
  };
}
