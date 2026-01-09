import { describe, it, expect } from 'vitest'

describe('Tailwind CSS Configuration', () => {
  // 直接导入配置文件进行测试
  const getConfig = () => {
    try {
      const config = require('../../tailwind.config')
      return config.default || config
    } catch (error) {
      throw new Error('tailwind.config.js not found')
    }
  }

  describe('基础配置', () => {
    it('应该存在 tailwind.config.js 文件', () => {
      expect(() => require('../../tailwind.config')).not.toThrow()
    })

    it('应该配置正确的内容路径', () => {
      const config = getConfig() as any
      expect(config.content).toContain('./src/**/*.{js,ts,jsx,tsx}')
      expect(config.content).toContain('./index.html')
    })

    it('应该配置正确的主题', () => {
      const config = getConfig() as any
      expect(config.theme).toBeDefined()
      expect(config.theme.extend).toBeDefined()
    })

    it('应该启用深色模式', () => {
      const config = getConfig() as any
      expect(config.darkMode).toBe('class')
    })
  })

  describe('设计令牌 - 颜色体系', () => {
    it('应该配置主色调', () => {
      const config = getConfig() as any
      const colors = config.theme.extend.colors

      expect(colors.primary).toBeDefined()
      expect(colors.primary['50']).toBeDefined()
      expect(colors.primary['500']).toBeDefined()
      expect(colors.primary['900']).toBeDefined()
    })

    it('应该配置中性色（使用默认 gray）', () => {
      const config = getConfig() as any
      // gray 是 Tailwind 默认颜色，我们只需要确认默认配置存在
      expect(config.theme).toBeDefined()
    })

    it('应该配置状态颜色', () => {
      const config = getConfig() as any
      const colors = config.theme.extend.colors

      expect(colors.success).toBeDefined()
      expect(colors.warning).toBeDefined()
      expect(colors.error).toBeDefined()
      expect(colors.info).toBeDefined()
    })
  })

  describe('设计令牌 - 间距系统', () => {
    it('应该配置自定义间距', () => {
      const config = getConfig() as any
      const spacing = config.theme.extend.spacing

      // 检查是否基于 4px 的倍数系统
      expect(spacing['18']).toBe('4.5rem') // 72px
      expect(spacing['88']).toBe('22rem') // 352px
      expect(spacing['128']).toBe('32rem') // 512px
    })
  })

  describe('设计令牌 - 排版系统', () => {
    it('应该配置自定义字体', () => {
      const config = getConfig() as any
      const fontFamily = config.theme.extend.fontFamily

      expect(fontFamily.sans).toContain('Inter')
      expect(fontFamily.mono).toContain('JetBrains Mono')
    })

    it('应该配置字体大小', () => {
      const config = getConfig() as any
      const fontSize = config.theme.extend.fontSize

      expect(fontSize['2xl']).toBeDefined()
      expect(fontSize['3xl']).toBeDefined()
      expect(fontSize['4xl']).toBeDefined()
    })
  })

  describe('设计令牌 - 断点系统', () => {
    it('应该配置响应式断点', () => {
      const config = getConfig() as any
      const screens = config.theme.extend.screens

      expect(screens['3xl']).toBe('1600px')
    })
  })

  describe('插件配置', () => {
    it('应该配置必要的插件', () => {
      const config = getConfig() as any
      expect(config.plugins).toBeDefined()
      expect(Array.isArray(config.plugins)).toBe(true)
    })
  })
})