import { useMemo } from 'react'
import { useMediaQuery } from './useMediaQuery'
import {
  BREAKPOINT_QUERIES,
  type BreakpointKey,
  isMobileBreakpoint,
  isTabletBreakpoint,
  isDesktopBreakpoint,
} from '../lib/breakpoints'

/**
 * useBreakpoint - Returns current responsive breakpoint
 *
 * SSR-safe hook that determines the current viewport breakpoint.
 * Uses mobile-first approach: returns 'xs' when no queries match.
 *
 * @returns BreakpointKey - Current breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 *
 * @example
 * const breakpoint = useBreakpoint()
 * // Returns 'xs' on mobile, 'md' on tablet, 'lg'/'xl'/'2xl' on desktop
 */
export function useBreakpoint(): BreakpointKey {
  // Check each breakpoint from smallest to largest
  const isSm = useMediaQuery(BREAKPOINT_QUERIES.sm)
  const isMd = useMediaQuery(BREAKPOINT_QUERIES.md)
  const isLg = useMediaQuery(BREAKPOINT_QUERIES.lg)
  const isXl = useMediaQuery(BREAKPOINT_QUERIES.xl)
  const is2xl = useMediaQuery(BREAKPOINT_QUERIES['2xl'])

  // Determine current breakpoint (largest matching breakpoint wins)
  const breakpoint = useMemo<BreakpointKey>(() => {
    if (is2xl) return '2xl'
    if (isXl) return 'xl'
    if (isLg) return 'lg'
    if (isMd) return 'md'
    if (isSm) return 'sm'
    return 'xs'
  }, [isSm, isMd, isLg, isXl, is2xl])

  return breakpoint
}

/**
 * useResponsive - Returns breakpoint with helper functions
 *
 * Extended version of useBreakpoint with convenience helpers
 * for common responsive checks.
 *
 * @example
 * const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive()
 */
export function useResponsive() {
  const breakpoint = useBreakpoint()

  return useMemo(
    () => ({
      breakpoint,
      isMobile: isMobileBreakpoint(breakpoint),
      isTablet: isTabletBreakpoint(breakpoint),
      isDesktop: isDesktopBreakpoint(breakpoint),
      // Comparison helpers
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2xl: breakpoint === '2xl',
      // Range helpers
      isSmUp: ['sm', 'md', 'lg', 'xl', '2xl'].includes(breakpoint),
      isMdUp: ['md', 'lg', 'xl', '2xl'].includes(breakpoint),
      isLgUp: ['lg', 'xl', '2xl'].includes(breakpoint),
      isXlUp: ['xl', '2xl'].includes(breakpoint),
      isSmDown: ['xs', 'sm'].includes(breakpoint),
      isMdDown: ['xs', 'sm', 'md'].includes(breakpoint),
      isLgDown: ['xs', 'sm', 'md', 'lg'].includes(breakpoint),
    }),
    [breakpoint]
  )
}
