# Task #18: 实现实时审批通知 (US-06) - WebSocket集成

## **🎯 目标**

为审批队列仪表板添加实时通知功能，当新的审批项目提交或状态变更时，通过WebSocket实时通知用户并更新界面。

## **📋 需求概述**

### 核心功能
- **WebSocket订阅**: 订阅 `approval:new` 和 `approval:updated` 频道
- **实时通知**: 新审批项目提交时显示toast通知
- **界面更新**: 实时更新审批队列数据，无需手动刷新
- **开发模拟**: 开发环境提供模拟器生成实时事件

### 技术要求
- 利用现有WebSocket基础设施 (`src/lib/websocket.ts`)
- 集成TanStack Query的缓存更新机制
- 使用sonner显示toast通知
- TypeScript严格模式，完整类型定义
- 遵循SOLID原则，组件化设计

## **🔗 可追溯性**

- **产品需求**: `specs/product.md#us-f005-approval-workflow`
- **架构文档**: `specs/architecture.md#websocket-architecture`
- **依赖任务**: Task #17 (审批队列仪表板) - 已完成
- **后续影响**: Task #15-16 (赎回详情和审批流程)

## **🏗️ 实现计划**

### Phase 1: WebSocket服务扩展
- 创建审批通知相关的WebSocket消息类型
- 实现订阅管理和消息处理逻辑
- 添加React hooks for WebSocket通知管理

### Phase 2: 实时更新集成
- 更新 `useApprovalQueue` hook 支持实时数据
- 修改 `ApprovalQueue` 组件集成实时更新
- 实现optimistic updates和错误处理

### Phase 3: 通知系统
- 创建toast通知组件和逻辑
- 实现新审批项目的通知显示
- 添加通知偏好设置（可选）

### Phase 4: 开发工具
- 创建开发模式通知模拟器
- 添加测试场景和调试工具
- 验证实时功能正确性

## **📊 复杂度评估**

- **复杂度**: 4 (中等)
- **预估时间**: 1天
- **风险等级**: 低 (基于现有WebSocket基础设施)
- **测试覆盖**: WebSocket hooks, 组件集成, 通知显示

## **🎨 UI/UX 要求**

- 通知显示不影响用户当前操作
- 实时更新平滑过渡，避免界面闪烁
- 连接状态指示器，明确显示实时功能状态
- 支持通知历史查看（可选）

## **🔐 安全考虑**

- WebSocket认证使用现有JWT token
- 通知数据不包含敏感信息
- 防止通知注入攻击
- 连接失败时的安全降级

## **✅ 验收标准**

1. [ ] WebSocket成功订阅 `approval:new` 频道
2. [ ] 新审批项目提交时显示toast通知
3. [ ] 审批队列实时更新，无需手动刷新
4. [ ] 连接断开时显示状态指示器
5. [ ] 开发模式模拟器正常工作
6. [ ] 生产构建无错误，性能影响最小
7. [ ] 所有现有功能保持正常工作

## **📁 文件结构计划**

```
src/
├── services/
│   ├── approval-notification-service.ts     # WebSocket通知服务
│   └── notification-mock-service.ts         # 开发模式模拟器
├── hooks/
│   └── useApprovalNotifications.ts          # 通知相关hooks
├── components/
│   ├── ui/
│   │   ├── notification-toast.tsx           # 通知toast组件
│   │   └── connection-indicator.tsx         # 连接状态指示器
│   └── approval-queue/
│       └── ApprovalQueue.tsx                # 更新: 添加实时功能
└── types/
    └── approval-notification.ts             # 通知相关类型定义
```

## **🧪 测试策略**

- **单元测试**: WebSocket hooks, 通知服务逻辑
- **集成测试**: 组件实时更新功能
- **E2E测试**: 完整的实时通知流程 (后续Task #30)
- **性能测试**: WebSocket连接对应用性能影响

---

**创建时间**: 2025-12-18
**负责人**: Ultra Builder Pro 4.1
**审核状态**: 待审核