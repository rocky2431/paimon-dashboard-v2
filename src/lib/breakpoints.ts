/**
 * Breakpoint Configuration
 *
 * Tailwind CSS-aligned breakpoint values for responsive design.
 * Mobile-first approach: base styles apply to smallest screens,
 * then breakpoints add styles for larger screens.
 */

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type BreakpointKey = keyof typeof breakpoints

/**
 * Media query strings for each breakpoint (min-width based)
 * Used with useMediaQuery hook for responsive behavior
 */
export const BREAKPOINT_QUERIES = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
} as const

/**
 * Ordered list of breakpoints from smallest to largest
 * Used for determining current breakpoint
 */
export const BREAKPOINT_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

/**
 * Helper to check if a breakpoint is mobile (xs or sm)
 */
export const isMobileBreakpoint = (bp: BreakpointKey): boolean => {
  return bp === 'xs' || bp === 'sm'
}

/**
 * Helper to check if a breakpoint is tablet (md)
 */
export const isTabletBreakpoint = (bp: BreakpointKey): boolean => {
  return bp === 'md'
}

/**
 * Helper to check if a breakpoint is desktop (lg, xl, 2xl)
 */
export const isDesktopBreakpoint = (bp: BreakpointKey): boolean => {
  return bp === 'lg' || bp === 'xl' || bp === '2xl'
}
