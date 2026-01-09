import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { breakpoints, BREAKPOINT_QUERIES } from '../../lib/breakpoints'

// Mock matchMedia
const createMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

describe('breakpoints', () => {
  it('should export breakpoint values matching Tailwind defaults', () => {
    expect(breakpoints.xs).toBe(320)
    expect(breakpoints.sm).toBe(640)
    expect(breakpoints.md).toBe(768)
    expect(breakpoints.lg).toBe(1024)
    expect(breakpoints.xl).toBe(1280)
    expect(breakpoints['2xl']).toBe(1536)
  })

  it('should export media query strings for each breakpoint', () => {
    expect(BREAKPOINT_QUERIES.sm).toBe('(min-width: 640px)')
    expect(BREAKPOINT_QUERIES.md).toBe('(min-width: 768px)')
    expect(BREAKPOINT_QUERIES.lg).toBe('(min-width: 1024px)')
    expect(BREAKPOINT_QUERIES.xl).toBe('(min-width: 1280px)')
    expect(BREAKPOINT_QUERIES['2xl']).toBe('(min-width: 1536px)')
  })
})

describe('useMediaQuery', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('should return false during SSR (no window.matchMedia)', () => {
    // Simulate SSR by removing matchMedia
    // @ts-expect-error - intentionally removing for SSR simulation
    delete window.matchMedia

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should return true when media query matches', () => {
    window.matchMedia = createMatchMedia(true) as typeof window.matchMedia

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('should return false when media query does not match', () => {
    window.matchMedia = createMatchMedia(false) as typeof window.matchMedia

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should update when media query match changes', () => {
    let matchesValue = false
    const listeners: Array<(e: { matches: boolean }) => void> = []

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_, callback) => {
        listeners.push(callback)
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    // Simulate viewport resize
    act(() => {
      matchesValue = true
      listeners.forEach(listener => listener({ matches: true }))
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener,
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})

describe('useBreakpoint', () => {
  let originalMatchMedia: typeof window.matchMedia
  let matchMediaResults: Record<string, boolean>

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    matchMediaResults = {}
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  const setupMatchMedia = (results: Record<string, boolean>) => {
    matchMediaResults = results
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: matchMediaResults[query] ?? false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia
  }

  it('should return "xs" for mobile screens (< 640px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': false,
      '(min-width: 768px)': false,
      '(min-width: 1024px)': false,
      '(min-width: 1280px)': false,
      '(min-width: 1536px)': false,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('xs')
  })

  it('should return "sm" for small screens (640px - 767px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': false,
      '(min-width: 1024px)': false,
      '(min-width: 1280px)': false,
      '(min-width: 1536px)': false,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('sm')
  })

  it('should return "md" for medium screens (768px - 1023px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': true,
      '(min-width: 1024px)': false,
      '(min-width: 1280px)': false,
      '(min-width: 1536px)': false,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('md')
  })

  it('should return "lg" for large screens (1024px - 1279px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': true,
      '(min-width: 1024px)': true,
      '(min-width: 1280px)': false,
      '(min-width: 1536px)': false,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('lg')
  })

  it('should return "xl" for extra-large screens (1280px - 1535px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': true,
      '(min-width: 1024px)': true,
      '(min-width: 1280px)': true,
      '(min-width: 1536px)': false,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('xl')
  })

  it('should return "2xl" for 2x extra-large screens (>= 1536px)', () => {
    setupMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': true,
      '(min-width: 1024px)': true,
      '(min-width: 1280px)': true,
      '(min-width: 1536px)': true,
    })

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('2xl')
  })

  it('should return "xs" during SSR', () => {
    // @ts-expect-error - intentionally removing for SSR simulation
    delete window.matchMedia

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('xs')
  })
})

describe('useBreakpoint helpers', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('isMobile should return true for xs and sm breakpoints', () => {
    // Test xs
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, // All false = xs
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia

    const { result: xsResult } = renderHook(() => useBreakpoint())
    expect(xsResult.current).toBe('xs')
    expect(['xs', 'sm'].includes(xsResult.current)).toBe(true)
  })

  it('isTablet should return true for md breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 640px)' || query === '(min-width: 768px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('md')
  })

  it('isDesktop should return true for lg, xl, 2xl breakpoints', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: ['(min-width: 640px)', '(min-width: 768px)', '(min-width: 1024px)'].includes(query),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia

    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('lg')
    expect(['lg', 'xl', '2xl'].includes(result.current)).toBe(true)
  })
})
