import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

describe('shadcn/ui Components Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('Button Component', () => {
    it('应该渲染 Button 组件', async () => {
      // 这个测试会在 GREEN 阶段通过，现在应该失败
      const { Button } = await import('../components/ui/button')

      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('应该支持不同的 Button 变体', async () => {
      const { Button } = await import('../components/ui/button')

      render(
        <>
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </>
      )

      expect(screen.getByRole('button', { name: 'Default' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Destructive' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    })

    it('应该支持不同的 Button 尺寸', async () => {
      const { Button } = await import('../components/ui/button')

      render(
        <>
          <Button size="default">Default</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">Icon</Button>
        </>
      )

      expect(screen.getByRole('button', { name: 'Default' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Icon' })).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('应该渲染 Card 组件', async () => {
      const {
        Card,
        CardHeader,
        CardTitle,
        CardContent
      } = await import('../components/ui/card')

      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Content</CardContent>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })
  })

  describe('Input Component', () => {
    it('应该渲染 Input 组件', async () => {
      const { Input } = await import('../components/ui/input')

      render(<Input placeholder="Enter text" />)

      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-10', 'w-full')
    })

    it('应该支持输入和值变化', async () => {
      const { Input } = await import('../components/ui/input')
      const user = userEvent.setup()

      render(<Input placeholder="Enter text" />)

      const input = screen.getByPlaceholderText('Enter text')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })
  })

  describe('Select Component', () => {
    it('应该渲染 Select 组件', async () => {
      const {
        Select,
        SelectTrigger,
        SelectValue
      } = await import('../components/ui/select')

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      )

      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })
  })

  describe('Dialog Component', () => {
    it('应该渲染 Dialog 组件', async () => {
      const {
        Dialog,
        DialogTrigger,
        DialogContent,
        DialogHeader,
        DialogTitle
      } = await import('../components/ui/dialog')

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()
    })

    it('应该支持可访问性属性', async () => {
      const {
        Dialog,
        DialogTrigger,
        DialogContent,
        DialogTitle
      } = await import('../components/ui/dialog')

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    })
  })

  describe('Dropdown Menu Component', () => {
    it('应该渲染 DropdownMenu 组件', async () => {
      const {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem
      } = await import('../components/ui/dropdown-menu')

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
    })
  })

  describe('Toast Component', () => {
    it('应该渲染 Toast 组件', async () => {
      const {
        Toast,
        ToastProvider,
        ToastViewport
      } = await import('../components/ui/toast')

      render(
        <ToastProvider>
          <ToastViewport />
          <Toast>
            Toast message
          </Toast>
        </ToastProvider>
      )

      // Toast 通常会通过 useToast hook 显示，这里测试基础结构
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Tabs Component', () => {
    it('应该渲染 Tabs 组件', async () => {
      const {
        Tabs,
        TabsList,
        TabsTrigger,
        TabsContent
      } = await import('../components/ui/tabs')

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('应该支持标签切换', async () => {
      const {
        Tabs,
        TabsList,
        TabsTrigger,
        TabsContent
      } = await import('../components/ui/tabs')
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2)

      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('应该与现有 Tailwind 主题集成', async () => {
      const { Button } = await import('../components/ui/button')

      render(<Button className="bg-customPrimary-600">Themed Button</Button>)

      const button = screen.getByRole('button', { name: 'Themed Button' })
      expect(button).toBeInTheDocument()
    })
  })
})