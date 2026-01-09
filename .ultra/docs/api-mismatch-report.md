# 前端与后端API匹配分析报告

> **生成日期**: 2026-01-03
> **后端文档版本**: 4.0.0 (原子化重构)
> **状态**: 需要修复

---

## 1. 认证模块 - 严重不匹配

| 对比项 | 后端API文档 | 前端实现 | 状态 |
|--------|-------------|----------|------|
| 登录方式 | 钱包签名登录 (`/auth/nonce` + `/auth/login`) | 邮箱登录 (`/email/login`) | ❌ 完全不同 |
| 登出 | `POST /auth/logout` | `POST /auth/logout` | ✓ |
| 刷新Token | `POST /auth/refresh` | `POST /auth/refresh` | ✓ |
| 获取用户 | `GET /auth/me` | `GET /auth/me` | ✓ |

### 需要修改

- 移除 `/email/login` 端点调用
- 实现 `POST /auth/nonce` - 请求登录随机数
- 实现 `POST /auth/login` - 钱包签名登录
- 集成 Web3 钱包连接 (ethers.js)

---

## 2. 基金模块 - 部分不匹配

| 端点 | 后端文档 | 前端实现 | 状态 |
|------|----------|----------|------|
| `/fund/overview` | ✓ | ✓ | ✓ |
| `/fund/summary` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/fund/yields` | ✓ | ✓ | ✓ |
| `/fund/nav/history` | 参数: `days`, `limit` | 参数: `timeframe` | ⚠️ 需修改参数 |
| `/fund/performance` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/fund/allocations/assets` | ✓ | ✓ | ✓ |
| `/fund/allocations/tiers` | ✓ | ✓ | ✓ |
| `/fund/fees` | ✓ | ✓ | ✓ |
| `/fund/flows` | ✓ | ✓ | ✓ |

### 需要修改

- 移除 `/fund/summary` 调用，使用 `/fund/overview` 替代
- 移除 `/fund/performance` 调用
- 修改 `/fund/nav/history` 参数从 `timeframe` 改为 `days`

---

## 3. 赎回模块 - 参数不匹配

| 端点 | 后端文档 | 前端实现 | 状态 |
|------|----------|----------|------|
| `GET /redemptions` | ✓ | ✓ | ✓ |
| `GET /redemptions/stats` | ✓ | ✓ | ✓ |
| `GET /redemptions/{id}` | ✓ | ✓ | ✓ |
| `POST /redemptions/{id}/approve` | 参数: `comment` | 参数: `action`, `notes` | ⚠️ 需修改 |
| `POST /redemptions/{id}/reject` | 独立端点, 参数: `reason` | 合并到approve | ⚠️ 需分离 |
| `POST /redemptions/{id}/settle` | 无参数 | 参数: `force`, `notes` | ⚠️ 需修改 |

### 需要修改

- `/redemptions/{id}/approve` 参数改为 `{ comment?: string }`
- 分离 reject 为独立端点 `/redemptions/{id}/reject`，参数 `{ reason: string }`
- `/redemptions/{id}/settle` 移除参数

---

## 4. 风险模块 - 多个端点缺失

| 端点 | 后端文档 | 前端实现 | 状态 |
|------|----------|----------|------|
| `GET /risk/dashboard` | ✓ | ✓ | ✓ |
| `GET /risk/alerts` | ✓ | ✓ | ✓ |
| `POST /risk/alerts/{id}/acknowledge` | ✓ | ✓ | ✓ |
| `POST /risk/alerts/{id}/resolve` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/alerts/history` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/indicators/liquidity` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/indicators/price` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/indicators/concentration` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/indicators/redemption` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `GET /risk/config` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `POST /risk/assess` | ✓ 存在 | ❌ 未使用 | ⚠️ 可选实现 |
| `POST /risk/forecast` | ✓ 存在 | ❌ 未使用 | ⚠️ 可选实现 |

### 需要修改

- 移除所有 `/risk/indicators/*` 端点调用
- 移除 `/risk/alerts/history` 调用
- 移除 `/risk/alerts/{id}/resolve` 调用
- 移除 `/risk/config` 调用
- 从 `/risk/dashboard` 获取所有风险数据

---

## 5. 再平衡模块 - 方法和端点不匹配

| 端点 | 后端文档 | 前端实现 | 状态 |
|------|----------|----------|------|
| `/rebalancing/deviation` | **POST** | **GET** | ❌ 方法需改 |
| `/rebalancing/preview` | **POST** | **GET** | ❌ 方法需改 |
| `/rebalancing/stats` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/rebalancing/trigger/manual` | ✓ POST | ✓ POST | ✓ |
| `/rebalancing/execute` | ✓ POST | ✓ POST | ✓ |
| `/rebalancing/plan/{id}` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/rebalancing/plan/{id}/approve` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/rebalancing/plan/{id}/cancel` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `/rebalancing/history/triggers` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |

### 需要修改

- `/rebalancing/deviation` 改为 POST 方法
- `/rebalancing/preview` 改为 POST 方法
- 移除所有 `/rebalancing/plan/*` 端点调用
- 移除 `/rebalancing/stats` 调用
- 移除 `/rebalancing/history/triggers` 调用

---

## 6. WebSocket频道 - 部分不匹配

| 频道 | 后端文档 | 前端实现 | 状态 |
|------|----------|----------|------|
| `fund:nav` | ✓ | ✓ | ✓ |
| `fund:overview` | ✓ | ✓ | ✓ |
| `fund:allocation` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |
| `redemption:new` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |
| `redemption:status` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |
| `approval:new` | ✓ | ✓ | ✓ |
| `approval:status` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |
| `risk:alert` | ✓ | ✓ | ✓ |
| `risk:score` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |
| `risk:alerts` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `risk:metrics` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `risk:trends` | ❌ 不存在 | ✓ 使用中 | ❌ 需移除 |
| `rebalance:status` | ✓ | ❌ 未订阅 | ⚠️ 可选添加 |

### 需要修改

- 移除 `risk:alerts`, `risk:metrics`, `risk:trends` 订阅
- 可选: 添加后端定义的其他频道订阅

---

## 修改优先级

| 优先级 | 模块 | 工作量 | 影响范围 |
|--------|------|--------|----------|
| **P0** | 认证模块 | 高 | 全局 - 无法登录 |
| **P1** | 赎回模块 | 中 | 核心功能 |
| **P1** | 风险模块 | 高 | 风控页面 |
| **P1** | 再平衡模块 | 高 | 再平衡功能 |
| **P2** | 基金模块 | 低 | Dashboard |
| **P2** | WebSocket | 低 | 实时更新 |

---

## 修改清单

### 必须修改的文件

1. `src/services/auth-simple.ts` - 认证服务
2. `src/services/api.ts` - FundService, RebalanceService
3. `src/services/redemption-api.ts` - 赎回API
4. `src/services/risk-monitoring-api.ts` - 风险API
5. `src/hooks/useRedemptions.ts` - 赎回hooks
6. `src/hooks/useRiskMonitoring.ts` - 风险hooks
7. `src/lib/websocket-client.ts` - WebSocket客户端
8. `src/hooks/useDashboardWebSocket.ts` - WebSocket hooks
9. `src/types/*.ts` - 类型定义

### 需要新增的文件

1. Web3 钱包连接组件
2. 钱包登录流程组件
