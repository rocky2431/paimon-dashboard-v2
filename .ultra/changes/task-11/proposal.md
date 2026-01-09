# Feature: Dashboard Overview Page (Task #11)

**Task ID**: 11
**Status**: In Progress
**Branch**: feat/task-11-dashboard-overview

## Overview

构建Paimon Admin Dashboard的核心Dashboard概览页面，为用户提供基金关键指标、可视化图表和实时事件的综合视图。这是用户登录后看到的主要界面，需要直观展示基金运营状况。

## Rationale

Dashboard overview是任何管理系统的核心入口，用户需要快速了解：
- 基金关键财务指标 (NAV, AUM, Shares)
- 资产配置和流动性分布
- NAV历史趋势
- 最新运营事件

这个页面将为后续的功能模块（赎回管理、风险监控、再平衡操作）提供上下文和快速导航。

## Impact Assessment

- **User Stories Affected**: US-F001 (Dashboard Overview)
- **Architecture Changes**: Yes - 集成图表库，实现数据可视化组件
- **Breaking Changes**: No - 新增页面，不影响现有功能

## Requirements Trace

- Traces to: specs/product.md#us-f001-dashboard-overview
- Depends on: Task #4 (路由布局), Task #6 (TanStack Query), Task #8 (WebSocket)

## Technical Implementation Plan

### 核心组件
1. **StatCards**: 关键指标卡片 (NAV, AUM, Shares)
2. **PieChart**: 流动性分布饼图
3. **LineChart**: NAV历史趋势线图
4. **RecentEvents**: 最新事件列表

### 技术栈
- **图表库**: 考虑使用 recharts 或 chart.js
- **数据获取**: TanStack Query hooks
- **实时更新**: WebSocket 订阅 fund:overview, fund:nav
- **响应式设计**: Tailwind CSS + shadcn/ui

### 数据模型
```typescript
interface DashboardStats {
  nav: number;
  aum: number;
  shares: number;
  lastUpdated: string;
}

interface LiquidityDistribution {
  category: string;
  value: number;
  percentage: number;
}

interface NAVHistory {
  date: string;
  value: number;
}

interface RecentEvent {
  id: string;
  type: 'redemption' | 'deposit' | 'rebalance' | 'risk_alert';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}
```

### 性能考虑
- 图表数据缓存和增量更新
- WebSocket消息去重和批处理
- 虚拟化长列表（RecentEvents）
- 懒加载图表组件