# Product Specification - Paimon Admin Dashboard

> Version: 1.1.0
> Status: Research Round 1 Complete
> Backend Reference: /Users/rocky243/paimon-backed
> Last Updated: 2025-12-15

## 1. Product Overview

### 1.1 Business Context

Paimon Admin Dashboard 是 **Paimon Prime Fund 后台管理系统**的前端界面：

- **目标用户**: B2B 企业用户 (基金管理公司内部团队)
- **核心价值**: 提供实时监控、操作管理、风险预警的统一界面
- **后端依赖**: Paimon Backend FastAPI 服务 (18个服务模块, 12个API端点)
- **项目规模**: 企业级 (50+ 页面)
- **时间周期**: 12+ 周

### 1.2 Problem Statement (Research Round 1)

#### 核心痛点
1. **实时监控**: 需要实时查看基金状态、风险指标、异常告警
2. **操作效率**: 赎回审批、再平衡执行等操作需要便捷高效
3. **合规审计**: 完整的操作记录、报告生成、审计追踪
4. **风险管控**: 风险预警、流动性预测、应急响应

#### 成功指标
| KPI | 目标值 | 衡量方式 |
|-----|--------|---------|
| 操作时效 | -50% | 审批/执行时间对比 |
| 风险反应 | <5min | 从告警到响应时间 |
| 审计合规 | -80% | 报告生成时间 |
| 用户满意 | >90% | 内部用户调研 |

#### DeFi 特殊需求
- 钱包集成 (MetaMask/WalletConnect)
- 链上数据展示 (交易哈希、区块确认)
- 多签工作流展示

### 1.3 Frontend System Positioning

前端系统负责以下功能的可视化和交互：

| 功能模块 | 对应后端服务 | 优先级 |
|---------|-------------|-------|
| **仪表板** | fund, metrics, websocket | Critical |
| **赎回管理** | redemption, approval | Critical |
| **再平衡操作** | rebalance, approval | Critical |
| **风险监控** | risk, forecasting | Critical |
| **审批工作流** | approval, audit | High |
| **报告中心** | reports | Normal |
| **系统设置** | auth, rbac, security | Normal |

### 1.3 System Boundaries

**Frontend IS responsible for:**
- 用户界面渲染和交互
- 数据可视化 (图表、仪表盘)
- 实时数据展示 (WebSocket)
- 表单验证和用户输入
- 客户端状态管理
- 路由和导航
- 用户认证流程 (JWT + 钱包签名)

**Frontend IS NOT responsible for:**
- 业务逻辑计算 (由后端处理)
- 链上交互 (由后端处理)
- 数据持久化 (由后端处理)
- 定时任务 (由后端处理)

## 2. User Stories (映射后端 US-001 ~ US-006)

### 2.1 US-F001: Dashboard Overview (对应 US-001)

**As a** system operator,
**I want to** see a real-time dashboard of fund status,
**So that** I can monitor system health and key metrics at a glance.

**Acceptance Criteria:**
- 显示基金概览 (NAV, AUM, 总份额)
- 显示三层流动性分布图表 (L1/L2/L3)
- 实时更新 (<1s 延迟, WebSocket)
- 显示最近事件列表
- 显示系统健康状态

**UI Components:**
- StatCard: NAV/AUM/Shares 统计卡片
- PieChart: 流动性层分布
- LineChart: NAV 历史走势
- EventList: 最近事件列表
- HealthIndicator: 系统状态指示器

---

### 2.2 US-F002: Redemption Management (对应 US-002)

**As an** admin,
**I want to** view and manage redemption requests,
**So that** I can process approvals and track settlements.

**Acceptance Criteria:**
- 赎回列表支持筛选 (状态, 渠道, 日期范围)
- 查看赎回详情和时间线
- 审批/拒绝需要审批的赎回
- 手动触发结算
- 导出赎回数据

**UI Components:**
- DataTable: 可筛选排序的赎回列表
- DetailDrawer: 赎回详情抽屉
- Timeline: 赎回处理时间线
- ApprovalModal: 审批对话框
- FilterBar: 筛选条件栏

**API Endpoints:**
- `GET /redemptions` - 获取赎回列表
- `GET /redemptions/{id}` - 获取赎回详情
- `POST /redemptions/{id}/approve` - 审批赎回
- `POST /redemptions/{id}/reject` - 拒绝赎回

---

### 2.3 US-F003: Rebalancing Operations (对应 US-003)

**As a** fund manager,
**I want to** execute asset rebalancing,
**So that** liquidity tiers stay within target ranges.

**Acceptance Criteria:**
- 显示当前偏离度和目标范围
- 预览再平衡计划 (before/after)
- 执行再平衡 (进入审批流程)
- 查看再平衡历史
- 手动触发再平衡

**UI Components:**
- DeviationChart: 偏离度柱状图
- RebalancePlanCard: 计划预览卡片
- ExecutionModal: 执行确认对话框
- HistoryTable: 历史记录表格
- StrategySelector: 策略选择器

**API Endpoints:**
- `GET /rebalance/status` - 获取当前状态
- `GET /rebalance/plan` - 获取计划预览
- `POST /rebalance/execute` - 执行再平衡
- `GET /rebalance/history` - 获取历史记录

---

### 2.4 US-F004: Risk Monitoring (对应 US-004)

**As a** risk officer,
**I want to** monitor real-time risk indicators,
**So that** I can respond to anomalies quickly.

**Acceptance Criteria:**
- 风险仪表盘显示所有关键指标
- 风险指标趋势图表
- 告警列表和详情
- 流动性预测图表
- 风险事件历史

**UI Components:**
- RiskDashboard: 风险指标仪表盘
- GaugeChart: 风险等级仪表
- AlertList: 告警列表
- ForecastChart: 预测趋势图
- HeatMap: 风险热力图

**API Endpoints:**
- `GET /risk/metrics` - 获取风险指标
- `GET /risk/alerts` - 获取告警列表
- `GET /risk/events` - 获取风险事件
- `GET /risk/forecast` - 获取流动性预测

---

### 2.5 US-F005: Approval Workflow (对应 US-005)

**As an** approver,
**I want to** review and approve pending operations,
**So that** sensitive operations are properly authorized.

**Acceptance Criteria:**
- 待审批列表 (按类型分类)
- 审批详情和风险评估
- 审批/拒绝并填写原因
- SLA 跟踪和超时提醒
- 审批历史记录

**UI Components:**
- ApprovalQueue: 待审批队列
- ApprovalDetail: 审批详情面板
- RiskAssessmentCard: 风险评估卡片
- SLAIndicator: SLA 进度指示器
- ReasonInput: 审批原因输入

**API Endpoints:**
- `GET /approvals/pending` - 获取待审批列表
- `GET /approvals/{id}` - 获取审批详情
- `POST /approvals/{id}/approve` - 通过审批
- `POST /approvals/{id}/reject` - 拒绝审批

---

### 2.6 US-F006: Reports Center (对应 US-006)

**As a** stakeholder,
**I want to** access daily/weekly/monthly reports,
**So that** I can track fund performance.

**Acceptance Criteria:**
- 报告类型选择 (日报/周报/月报)
- 报告预览
- 导出为 PDF/Excel
- 报告历史和归档
- 自定义报告时间范围

**UI Components:**
- ReportTypeSelector: 报告类型选择
- ReportPreview: 报告预览区
- ExportButtons: 导出按钮组
- HistoryList: 历史报告列表
- DateRangePicker: 日期范围选择

**API Endpoints:**
- `GET /reports/daily` - 获取日报
- `GET /reports/weekly` - 获取周报
- `GET /reports/monthly` - 获取月报
- `GET /reports/export` - 导出报告

---

### 2.7 US-F007: Authentication & Settings

**As a** user,
**I want to** securely login and manage my settings,
**So that** I can access the system safely.

**Acceptance Criteria:**
- JWT + 钱包签名双重认证
- 角色权限展示
- 个人设置管理
- 审计日志查看
- 安全配置 (IP 白名单查看)

**UI Components:**
- LoginForm: 登录表单
- WalletConnect: 钱包连接组件
- SettingsPanel: 设置面板
- AuditLogTable: 审计日志表格
- PermissionDisplay: 权限展示

**API Endpoints:**
- `POST /auth/login` - 登录
- `POST /auth/wallet-signature` - 钱包签名
- `POST /auth/refresh` - 刷新令牌
- `GET /audit/logs` - 获取审计日志

## 3. Functional Requirements

### 3.1 Page Structure

```
/                          → Dashboard (仪表板)
/redemptions               → Redemption List (赎回列表)
/redemptions/:id           → Redemption Detail (赎回详情)
/rebalance                 → Rebalance Operations (再平衡)
/rebalance/history         → Rebalance History (历史记录)
/risk                      → Risk Dashboard (风险监控)
/risk/alerts               → Alert Management (告警管理)
/risk/forecast             → Liquidity Forecast (流动性预测)
/approvals                 → Approval Queue (审批队列)
/approvals/:id             → Approval Detail (审批详情)
/reports                   → Reports Center (报告中心)
/settings                  → System Settings (系统设置)
/settings/audit            → Audit Logs (审计日志)
/login                     → Login Page (登录页)
```

### 3.2 WebSocket Subscriptions

实时数据通过 WebSocket 推送：

| Channel | Description | Update Frequency |
|---------|-------------|-----------------|
| `fund:overview` | 基金概览更新 | Every minute |
| `fund:nav` | NAV 实时更新 | Real-time |
| `redemption:new` | 新赎回请求 | Event-driven |
| `risk:alert` | 风险告警 | Event-driven |
| `approval:new` | 新审批票据 | Event-driven |

### 3.3 RBAC Permission Matrix

| Role | Dashboard | Redemptions | Rebalance | Risk | Approvals | Reports | Settings |
|------|-----------|-------------|-----------|------|-----------|---------|----------|
| super_admin | ✅ | ✅ Edit | ✅ Execute | ✅ | ✅ | ✅ | ✅ Edit |
| admin | ✅ | ✅ Edit | ✅ View | ✅ | ✅ View | ✅ | ✅ View |
| operator | ✅ | ✅ View | ✅ View | ✅ | ❌ | ✅ View | ❌ |
| viewer | ✅ | ✅ View | ❌ | ✅ View | ❌ | ✅ View | ❌ |

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Interaction to Next Paint | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| WebSocket Latency | < 500ms |
| API Response Display | < 300ms after response |

### 4.2 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 4.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratio > 4.5:1

### 4.4 Internationalization

- 中文 (简体) - 主要语言
- English - 次要语言
- 日期/时间本地化
- 数字格式本地化

## 5. Design Specifications

### 5.1 Design System

- **Primary Color**: [NEEDS CLARIFICATION] - 品牌主色
- **Component Library**: shadcn/ui + Radix UI (完全可定制)
- **Styling**: Tailwind CSS (utility-first)
- **Typography**: System font stack (无默认字体)
- **Spacing**: 8px grid system (Tailwind space-2)
- **Border Radius**: 6px (cards), 4px (inputs)

### 5.2 Layout

```
┌─────────────────────────────────────────────────────────┐
│                      Header (64px)                       │
│  Logo  │  Navigation  │  Notifications  │  User Menu    │
├────────┼────────────────────────────────────────────────┤
│        │                                                │
│ Sider  │                 Content                        │
│ (240px)│                                                │
│        │                                                │
│  Menu  │              Page Content                      │
│        │                                                │
│        │                                                │
├────────┴────────────────────────────────────────────────┤
│                      Footer (48px)                       │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Component Patterns

- **Tables**: 固定表头, 虚拟滚动 (>100行)
- **Charts**: ECharts 主题统一
- **Forms**: 实时验证, 错误提示
- **Modals**: 居中弹出, 背景遮罩
- **Notifications**: 右上角 toast

## 6. Development Roadmap

### Phase 1: Foundation (Week 1-2)
- 项目初始化 (Vite + React + TypeScript)
- 设计系统和主题配置
- 路由和布局框架
- 认证模块
- API 客户端封装

### Phase 2: Core Features (Week 2-4)
- Dashboard 仪表板 (US-02)
- 赎回列表管理 (US-03)
- 赎回详情与时间线 (US-04)
- 赎回审批操作 (US-05)
- 审批队列看板 (US-06)
- WebSocket 基础集成

### Phase 3: Risk & Rebalance (Week 5-8)
- 风险监控仪表板 (US-07)
- 风险告警管理 (US-08)
- 再平衡状态查看 (US-09)
- 再平衡计划执行 (US-10)
- 流动性预测图表 (US-11)
- 移动端响应式适配

### Phase 4: Reports & Polish (Week 9-12)
- 报告生成与导出 (US-12)
- 审计日志查询 (US-13)
- 用户设置与偏好 (US-14)
- 性能优化
- E2E 测试
- 部署和文档

## 7. User Story Priority Matrix (Research Round 2)

### 7.1 Priority Levels

| Priority | Stories | Description |
|----------|---------|-------------|
| **P0** | US-01~06 | 核心功能，必须首批交付 |
| **P1** | US-07~11 | 重要功能，第二批交付 |
| **P2** | US-12~14 | 增强功能，第三批交付 |

### 7.2 Story Summary

| ID | Story | Priority | Complexity | Phase |
|----|-------|----------|------------|-------|
| US-01 | 用户登录与钱包认证 | P0 | Medium | 1 |
| US-02 | Dashboard 实时概览 | P0 | High | 2 |
| US-03 | 赎回列表管理 | P0 | Medium | 2 |
| US-04 | 赎回详情与时间线 | P0 | Medium | 2 |
| US-05 | 赎回审批操作 | P0 | High | 2 |
| US-06 | 审批队列看板 | P0 | Medium | 2 |
| US-07 | 风险监控仪表板 | P1 | High | 3 |
| US-08 | 风险告警管理 | P1 | Medium | 3 |
| US-09 | 再平衡状态查看 | P1 | Medium | 3 |
| US-10 | 再平衡计划执行 | P1 | High | 3 |
| US-11 | 流动性预测图表 | P1 | High | 3 |
| US-12 | 报告生成与导出 | P2 | Medium | 4 |
| US-13 | 审计日志查询 | P2 | Low | 4 |
| US-14 | 用户设置与偏好 | P2 | Low | 4 |

### 7.3 Real-time Update Strategy

| Data Type | Update Mode | Technology |
|-----------|-------------|------------|
| NAV/关键指标 | 秒级 (Real-time) | WebSocket |
| 风险告警 | 秒级 (Event-driven) | WebSocket |
| 审批通知 | 秒级 (Event-driven) | WebSocket |
| 赎回列表 | 分钟级 (Polling) | React Query (staleTime: 60s) |
| 报告数据 | 分钟级 (Polling) | React Query (staleTime: 300s) |

### 7.4 Mobile Support

- 完整移动端支持 (响应式设计)
- Tailwind 断点: sm (640px) / md (768px) / lg (1024px) / xl (1280px)
- 移动端表格转卡片布局
- 底部导航替代侧边栏
- 触摸友好交互 (min 44px touch target)

## 8. Risk Assessment (Research Round 4)

### 8.1 Risk Matrix

| 风险 | 概率 | 影响 | 优先级 | 缓解策略 |
|------|------|------|--------|----------|
| WebSocket 连接不稳定 | 中 | 高 | **P0** | 指数退避重连 + 心跳机制 |
| shadcn/ui 组件不足 | 低 | 中 | P1 | 预留业务组件开发时间 |
| 大表格性能问题 | 中 | 中 | P1 | TanStack Table 虚拟化 + 分页 |
| 移动端适配超预期 | 中 | 低 | P2 | 优先桌面端，移动端渐进增强 |
| wagmi 版本升级 | 低 | 低 | P3 | 锁定主版本 2.x |

### 8.2 Risk Assessment Summary

**总体风险评估**: 低风险

**关键发现**:
1. 技术栈经过 Context7 验证，所有核心库均为高声誉、活跃维护
2. 团队技能与技术栈高度匹配，学习成本 < 3 天
3. 后端 API 已稳定，集成风险最小化
4. 主要关注点是 WebSocket 稳定性

### 8.3 Contingency Plans

**WebSocket 稳定性问题**:
- 行动: 切换为 React Query 轮询 fallback
- 降级: 关键指标实时，非关键数据分钟级更新

**进度延迟**:
- 行动: P2 功能延后，确保 P0/P1 按时
- 备选: 简化移动端适配范围

### 8.4 Success Probability

| 场景 | 概率 | 结果 |
|------|------|------|
| 顺利执行 | 60% | 12 周内完成所有功能 |
| 中等挑战 | 30% | P0/P1 按时，P2 延后 2-3 周 |
| 重大挑战 | 10% | 需要 16+ 周 |

---

**Reference Documents:**
- Backend Product Spec: `/Users/rocky243/paimon-backed/.ultra/specs/product.md`
- Backend Architecture: `/Users/rocky243/paimon-backed/.ultra/specs/architecture.md`
- Backend API Docs: `/Users/rocky243/paimon-backed/docs/backend/05-api-specification.md`
