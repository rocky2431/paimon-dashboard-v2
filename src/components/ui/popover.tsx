/**
 * Popover Component
 * Simple popover implementation
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}

export function Popover({ children }: PopoverProps) {
  return <>{children}</>
}

export function PopoverTrigger({ asChild = false, children, ...props }: PopoverTriggerProps) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, props)
  }

  return (
    <button {...props}>
      {children}
    </button>
  )
}

export function PopoverContent({
  children,
  className,
  align = 'center',
  ...props
}: PopoverContentProps) {
  return (
    <div
      className={cn(
        'absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md',
        'outline-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}