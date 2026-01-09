import { describe, it, expect } from 'vitest'

describe('shadcn/ui CLI Configuration', () => {
  it('应该存在 components.json 配置文件', () => {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.resolve(__dirname, '../../components.json')

    expect(fs.existsSync(configPath)).toBe(true)
  })

  it('应该存在 utils 工具函数', () => {
    const fs = require('fs')
    const path = require('path')
    const utilsPath = path.resolve(__dirname, '../../../src/lib/utils.ts')

    expect(fs.existsSync(utilsPath)).toBe(true)
  })

  it('应该能导入 cn 工具函数', async () => {
    const utils = await import('@/lib/utils')
    expect(utils.cn).toBeDefined()
    expect(typeof utils.cn).toBe('function')
  })
})