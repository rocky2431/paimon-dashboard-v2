import { useState, useEffect, useCallback } from 'react'

/**
 * useMediaQuery - SSR-safe media query hook
 *
 * Returns a boolean indicating if the media query matches.
 * Handles SSR by returning false initially (mobile-first approach).
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean - true if the query matches, false otherwise
 *
 * @example
 * const isMd = useMediaQuery('(min-width: 768px)')
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR safety (mobile-first)
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia(query).matches
    }
    return false
  })

  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches)
  }, [])

  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQueryList.matches)

    // Add listener for changes
    mediaQueryList.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query, handleChange])

  return matches
}
