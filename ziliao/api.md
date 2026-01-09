
  1. 认证模块 (/auth/*)

  | 方法    | 端点                    | 说明      |
  |-------|-----------------------|---------|
  | POST  | /auth/login           | 登录      |
  | POST  | /auth/logout          | 登出      |
  | POST  | /auth/refresh         | 刷新Token |
  | GET   | /auth/verify          | 验证Token |
  | GET   | /auth/profile         | 获取用户信息  |
  | PATCH | /auth/profile         | 更新用户信息  |
  | POST  | /auth/change-password | 修改密码    |
  | POST  | /auth/forgot-password | 忘记密码    |
  | POST  | /auth/reset-password  | 重置密码    |

  2. 钱包认证 (/auth/wallet/*)

  | 方法   | 端点                          | 说明        |
  |------|-----------------------------|-----------|
  | POST | /auth/wallet/nonce          | 获取签名Nonce |
  | POST | /auth/wallet/verify         | 验证钱包签名    |
  | POST | /auth/wallet/link           | 链接钱包      |
  | POST | /auth/wallet/unlink         | 取消链接      |
  | GET  | /auth/wallet/check/:address | 检查钱包状态    |

  3. 仪表板 (/dashboard/*)

  | 方法  | 端点                  | 说明      |
  |-----|---------------------|---------|
  | GET | /dashboard          | 完整仪表板数据 |
  | GET | /dashboard/overview | 概览统计    |
  | GET | /dashboard/metrics  | 指标数据    |
  | GET | /dashboard/events   | 最近事件    |

  4. 赎回管理 (/redemptions/*)

  | 方法   | 端点                       | 说明   |
  |------|--------------------------|------|
  | GET  | /redemptions             | 赎回列表 |
  | GET  | /redemptions/:id         | 赎回详情 |
  | GET  | /redemptions/stats       | 统计数据 |
  | POST | /redemptions/:id/approve | 批准   |
  | POST | /redemptions/:id/reject  | 拒绝   |
  | POST | /redemptions/:id/process | 处理   |
  | POST | /redemptions/bulk        | 批量操作 |
  | GET  | /redemptions/export      | 导出   |

  5. 审批队列 (/approval-queue/*)

  | 方法   | 端点                          | 说明   |
  |------|-----------------------------|------|
  | GET  | /approval-queue             | 审批列表 |
  | POST | /approval-queue/:id/approve | 快速批准 |
  | POST | /approval-queue/:id/reject  | 快速拒绝 |
  | POST | /approval-queue/:id/assign  | 分配   |

  6. 风险监控 (/risk-monitoring/*)

  | 方法   | 端点                                      | 说明    |
  |------|-----------------------------------------|-------|
  | GET  | /risk-monitoring/dashboard              | 风险仪表板 |
  | GET  | /risk-monitoring/metrics                | 风险指标  |
  | GET  | /risk-monitoring/alerts                 | 告警列表  |
  | GET  | /risk-monitoring/trends                 | 趋势数据  |
  | POST | /risk-monitoring/alerts/:id/acknowledge | 确认告警  |
  | POST | /risk-monitoring/alerts/:id/resolve     | 解决告警  |
  | POST | /risk-monitoring/alerts/:id/dismiss     | 忽略告警  |
  | POST | /risk-monitoring/alerts/:id/assign      | 分配告警  |
  | POST | /risk-monitoring/alerts/batch/*         | 批量操作  |
  | POST | /risk-monitoring/export                 | 导出报告  |

  7. 再平衡 (/rebalance/*)

  | 方法   | 端点                 | 说明   |
  |------|--------------------|------|
  | GET  | /rebalance/status  | 状态   |
  | GET  | /rebalance/plans   | 计划列表 |
  | POST | /rebalance/execute | 执行   |

  8. 报告 (/reports/*)

  | 方法   | 端点                    | 说明   |
  |------|-----------------------|------|
  | GET  | /reports              | 报告列表 |
  | POST | /reports/generate     | 生成报告 |
  | GET  | /reports/:id/download | 下载   |

  9. 用户 (/user/*)

  | 方法  | 端点                  | 说明   |
  |-----|---------------------|------|
  | GET | /user/profile       | 用户资料 |
  | PUT | /user/profile       | 更新资料 |
  | GET | /user/settings      | 设置   |
  | PUT | /user/settings      | 更新设置 |
  | GET | /user/notifications | 通知   |