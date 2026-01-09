# Feature: Build approval queue dashboard (US-06)

**Task ID**: 17
**Status**: In Progress
**Branch**: feat/task-17-approval-queue

## Overview
创建一个集中式的审批队列仪表板，用于显示和管理所有待处理的审批项目。该仪表板将按类型对项目进行分组，提供SLA时间指示器，并支持快速操作功能。

## Rationale
当前系统缺乏一个统一的审批队列视图，管理员无法快速了解所有待处理的审批请求。该功能将：
- 提高审批效率，减少处理时间
- 通过SLA指示器帮助识别紧急项目
- 提供统一的审批管理界面
- 支持批量操作和快速决策

## Impact Assessment
- **User Stories Affected**: specs/product.md#us-f005-approval-workflow
- **Architecture Changes**: No - 使用现有组件架构
- **Breaking Changes**: No - 纯新增功能

## Requirements Trace
- Traces to: specs/product.md#us-f005-approval-workflow

## Implementation Plan
1. 创建 ApprovalQueue 主组件
2. 实现按类型分组的队列显示
3. 添加SLA时间指示器
4. 实现快速操作按钮
5. 集成通知徽章显示
6. 添加WebSocket实时更新支持

## Success Criteria
- 所有待处理审批项目按类型清晰分组
- SLA超时项目明显标识
- 支持快速批准/拒绝操作
- 实时更新新提交的审批请求
- 响应式设计，支持移动端访问