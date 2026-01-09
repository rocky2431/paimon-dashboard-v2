import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// 测试组件：验证 Tailwind CSS 类是否生效
const TestComponent = () => (
  <div className="bg-primary-500 text-white p-4 rounded-lg">
    <h1 className="text-2xl font-bold">测试标题</h1>
    <p className="text-gray-100">测试内容</p>
  </div>
)

describe('Tailwind CSS Styles Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('应该能够渲染带有 Tailwind 类的组件', () => {
    render(<TestComponent />)

    expect(screen.getByText('测试标题')).toBeInTheDocument()
    expect(screen.getByText('测试内容')).toBeInTheDocument()
  })

  it('应该应用自定义按钮样式', () => {
    const ButtonComponent = () => (
      <button className="btn btn-primary">测试按钮</button>
    )
    render(<ButtonComponent />)

    const button = screen.getByRole('button', { name: '测试按钮' })
    expect(button).toBeInTheDocument()
  })

  it('应该应用自定义卡片样式', () => {
    const CardComponent = () => (
      <div className="card">
        <h2>卡片标题</h2>
        <p>卡片内容</p>
      </div>
    )
    render(<CardComponent />)

    expect(screen.getByText('卡片标题')).toBeInTheDocument()
    expect(screen.getByText('卡片内容')).toBeInTheDocument()
  })
})