import { describe, it, expect } from 'vitest'

describe('PostCSS Configuration', () => {
  it('应该存在 postcss.config.js 文件', () => {
    expect(() => require('../../postcss.config')).not.toThrow()
  })

  it('应该正确配置 Tailwind CSS 和 Autoprefixer', () => {
    const postcssConfig = require('../../postcss.config')

    expect(postcssConfig.plugins).toBeDefined()
    expect(postcssConfig.plugins.tailwindcss).toBeDefined()
    expect(postcssConfig.plugins.autoprefixer).toBeDefined()
  })
})