# 实现计划：积分奖励制度

## 概述

本计划将积分奖励制度功能分解为可执行的编码任务，采用增量式开发方式，确保每个步骤都能验证核心功能。技术栈：Cloudflare Workers + Hono + D1（后端），React + TypeScript（前端）。

## 任务

- [ ] 1. 数据库表结构和类型定义
  - [ ] 1.1 创建积分相关数据库表
    - 在 workers/schema.sql 中添加 user_points、points_logs、products、redemption_orders、makeup_requests 表
    - 创建必要的索引
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 1.2 创建 TypeScript 类型定义
    - 在 workers/src/types/points.ts 中定义 UserPoints、PointsLog、Product、RedemptionOrder、MakeupRequest 接口
    - _Requirements: 10.4_

- [ ] 2. 积分核心服务实现
  - [ ] 2.1 实现积分计算服务
    - 创建 workers/src/services/pointsService.ts
    - 实现 calculatePoints(consecutiveMonths) 函数
    - 实现 getUserPoints(userId) 函数
    - 实现 addPointsForDetection(userId, assessmentId) 函数
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 2.2 编写积分计算公式属性测试
    - **Property 1: 积分计算公式正确性**
    - **Validates: Requirements 1.1**
  
  - [ ] 2.3 编写同月检测幂等性属性测试
    - **Property 2: 同月检测幂等性**
    - **Validates: Requirements 1.2**
  
  - [ ] 2.4 实现连续月数追踪服务
    - 实现 updateConsecutiveMonths(userId, detectionMonth) 函数
    - 实现 checkAndResetStreak(userId) 函数
    - 实现 getNextReward(userId) 函数
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.5 编写连续月数状态机属性测试
    - **Property 4: 连续月数状态机**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 3. 检查点 - 确保积分核心服务测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 4. 补测功能实现
  - [ ] 4.1 实现补测申请服务
    - 创建 workers/src/services/makeupService.ts
    - 实现 applyForMakeup(userId, targetMonth) 函数
    - 实现 approveMakeup(requestId, adminId) 函数
    - 实现 rejectMakeup(requestId, adminId, reason) 函数
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 4.2 编写补测积分固定值属性测试
    - **Property 5: 补测积分固定值**
    - **Validates: Requirements 3.2**
  
  - [ ] 4.3 编写补测次数限制属性测试
    - **Property 6: 补测次数限制**
    - **Validates: Requirements 3.3**

- [ ] 5. 积分 API 路由实现
  - [ ] 5.1 创建积分路由
    - 创建 workers/src/routes/points.ts
    - 实现 GET /api/points/summary 获取积分概览
    - 实现 GET /api/points/history 获取积分历史
    - 实现 POST /api/points/makeup/apply 申请补测
    - 实现 GET /api/points/makeup/status 查询补测状态
    - _Requirements: 2.3, 2.4, 3.1, 3.5_
  
  - [ ] 5.2 集成积分计算到检测流程
    - 修改 workers/src/routes/assessments.ts
    - 在保存检测结果后调用积分计算服务
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. 检查点 - 确保积分 API 正常工作
  - 确保所有测试通过，如有问题请询问用户

- [ ] 7. 商品和兑换服务实现
  - [ ] 7.1 实现商品服务
    - 创建 workers/src/services/productService.ts
    - 实现 getProducts(category?, sortBy?) 函数
    - 实现 getProductById(productId) 函数
    - 实现 createProduct(product) 函数
    - 实现 updateProduct(productId, updates) 函数
    - 实现 deactivateProduct(productId) 函数
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 7.2 编写商品列表排序属性测试
    - **Property 8: 商品列表排序**
    - **Validates: Requirements 5.4**
  
  - [ ] 7.3 实现兑换服务
    - 创建 workers/src/services/redemptionService.ts
    - 实现 checkRedemptionEligibility(userId, productId, quantity) 函数
    - 实现 redeemProduct(userId, productId, quantity) 函数
    - 实现 getUserOrders(userId) 函数
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 7.4 编写兑换资格验证属性测试
    - **Property 7: 兑换资格验证**
    - **Validates: Requirements 4.1, 4.2, 4.4**
  
  - [ ] 7.5 编写库存为零禁止兑换属性测试
    - **Property 9: 库存为零禁止兑换**
    - **Validates: Requirements 5.2**
  
  - [ ] 7.6 编写兑换事务一致性属性测试
    - **Property 10: 兑换事务一致性**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 8. 商店 API 路由实现
  - [ ] 8.1 创建商店路由
    - 创建 workers/src/routes/store.ts
    - 实现 GET /api/store/products 获取商品列表
    - 实现 GET /api/store/products/:id 获取商品详情
    - 实现 POST /api/store/redeem 兑换商品
    - 实现 GET /api/store/orders 获取兑换订单
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 9. 检查点 - 确保商店功能正常工作
  - 确保所有测试通过，如有问题请询问用户

- [ ] 10. 管理后台 API 实现
  - [ ] 10.1 扩展管理路由 - 商品管理
    - 修改 workers/src/routes/admin.ts
    - 实现 GET /api/admin/products 获取商品列表
    - 实现 POST /api/admin/products 添加商品
    - 实现 PUT /api/admin/products/:id 更新商品
    - 实现 DELETE /api/admin/products/:id 下架商品
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.2 扩展管理路由 - 订单管理
    - 实现 GET /api/admin/orders 获取订单列表
    - 实现 PUT /api/admin/orders/:id/status 更新订单状态
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 10.3 编写订单状态筛选属性测试
    - **Property 11: 订单状态筛选**
    - **Validates: Requirements 8.1**
  
  - [ ] 10.4 扩展管理路由 - 用户积分管理
    - 实现 GET /api/admin/points/users 获取用户积分列表
    - 实现 GET /api/admin/points/users/:id 获取用户积分详情
    - 实现 POST /api/admin/points/users/:id/adjust 调整用户积分
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 10.5 编写积分调整非负约束属性测试
    - **Property 12: 积分调整非负约束**
    - **Validates: Requirements 9.4**
  
  - [ ] 10.6 扩展管理路由 - 补测审核
    - 实现 GET /api/admin/makeup-requests 获取补测申请列表
    - 实现 PUT /api/admin/makeup-requests/:id 审核补测申请
    - _Requirements: 3.5_

- [ ] 11. 注册路由到主应用
  - 修改 workers/src/index.ts
  - 注册 pointsRoutes、storeRoutes
  - _Requirements: 所有 API 相关需求_

- [ ] 12. 检查点 - 确保后端 API 全部正常工作
  - 确保所有测试通过，如有问题请询问用户

- [ ] 13. 前端 API 服务层
  - [ ] 13.1 创建积分 API 服务
    - 创建 frontend/src/api/points.ts
    - 实现 getPointsSummary、getPointsHistory、applyMakeup、getMakeupStatus 函数
    - _Requirements: 2.3, 2.4, 3.1, 3.5_
  
  - [ ] 13.2 创建商店 API 服务
    - 创建 frontend/src/api/store.ts
    - 实现 getProducts、getProductById、redeemProduct、getOrders 函数
    - _Requirements: 5.1, 6.1, 6.4_

- [ ] 14. 前端积分中心页面
  - [ ] 14.1 创建积分概览组件
    - 创建 frontend/src/components/points/PointsSummary.tsx
    - 显示积分余额、连续月数、下次可获积分
    - _Requirements: 2.3, 2.4_
  
  - [ ] 14.2 创建积分历史组件
    - 创建 frontend/src/components/points/PointsHistory.tsx
    - 显示积分变动列表
    - _Requirements: 1.4_
  
  - [ ] 14.3 创建补测申请组件
    - 创建 frontend/src/components/points/MakeupRequestForm.tsx
    - 实现补测申请表单
    - _Requirements: 3.1_
  
  - [ ] 14.4 创建积分中心页面
    - 创建 frontend/src/pages/PointsCenter.tsx
    - 整合积分概览、历史、补测申请组件
    - _Requirements: 2.3, 2.4, 3.1_

- [ ] 15. 前端积分商店页面
  - [ ] 15.1 创建商品卡片组件
    - 创建 frontend/src/components/store/ProductCard.tsx
    - 显示商品图片、名称、所需积分、库存状态
    - _Requirements: 5.1, 5.2_
  
  - [ ] 15.2 创建商品网格组件
    - 创建 frontend/src/components/store/ProductGrid.tsx
    - 实现分类筛选和商品列表展示
    - _Requirements: 5.3, 5.4_
  
  - [ ] 15.3 创建兑换确认弹窗
    - 创建 frontend/src/components/store/RedeemModal.tsx
    - 实现兑换确认流程
    - _Requirements: 6.1_
  
  - [ ] 15.4 创建积分商店页面
    - 创建 frontend/src/pages/PointsStore.tsx
    - 整合商品网格、兑换弹窗
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1_
  
  - [ ] 15.5 创建兑换记录页面
    - 创建 frontend/src/pages/RedemptionHistory.tsx
    - 显示用户兑换订单列表
    - _Requirements: 6.4_

- [ ] 16. 检查点 - 确保前端用户功能正常工作
  - 确保所有测试通过，如有问题请询问用户

- [ ] 17. 前端管理后台页面
  - [ ] 17.1 创建商品管理页面
    - 创建 frontend/src/pages/admin/ProductManagement.tsx
    - 实现商品列表、添加、编辑、下架功能
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 17.2 创建订单管理页面
    - 创建 frontend/src/pages/admin/OrderManagement.tsx
    - 实现订单列表、状态筛选、状态更新功能
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 17.3 创建用户积分管理页面
    - 创建 frontend/src/pages/admin/PointsManagement.tsx
    - 实现用户积分查看、搜索、调整功能
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 17.4 扩展管理后台导航
    - 修改 frontend/src/pages/AdminDashboard.tsx
    - 添加积分管理、商品管理、订单管理入口
    - _Requirements: 7.4, 8.1, 9.1_

- [ ] 18. 前端路由配置
  - 修改 frontend/src/App.tsx 或路由配置文件
  - 添加积分中心、积分商店、兑换记录、管理后台子页面路由
  - _Requirements: 所有前端相关需求_

- [ ] 19. 最终检查点 - 确保所有功能正常工作
  - 确保所有测试通过，如有问题请询问用户

- [ ] 20. 编写数据持久化往返一致性属性测试
  - **Property 13: 数据持久化往返一致性**
  - **Validates: Requirements 10.4**

## 备注

- 所有任务均为必需任务，包括属性测试
- 每个任务都引用了具体的需求编号，确保可追溯性
- 检查点任务用于确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
