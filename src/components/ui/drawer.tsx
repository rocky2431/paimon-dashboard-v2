/**
 * Drawer Component
 * Simple drawer implementation for alerts
 */

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

interface DrawerContentProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

interface DrawerHeaderProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Drawer({ open, children, className }: DrawerProps) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-full max-w-lg transform transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : 'translate-x-full',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DrawerContent({ children, className, ...props }: DrawerContentProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col bg-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DrawerHeader({ children, className, ...props }: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DrawerTitle({ className, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

export function DrawerClose({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0"
    >
      <X className="h-4 w-4" />
    </Button>
  )
}