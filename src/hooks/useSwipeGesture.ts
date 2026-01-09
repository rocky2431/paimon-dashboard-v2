import { useEffect, useRef, useCallback } from 'react'

export interface SwipeGestureOptions {
  /** Minimum distance in pixels to trigger swipe (default: 50) */
  threshold?: number
  /** Maximum time in ms for swipe gesture (default: 300) */
  maxTime?: number
  /** Edge zone width in pixels for edge swipes (default: 30) */
  edgeZone?: number
  /** Only trigger if swipe starts from left edge */
  requireLeftEdge?: boolean
  /** Only trigger if swipe starts from right edge */
  requireRightEdge?: boolean
  /** Callback when swiping left */
  onSwipeLeft?: () => void
  /** Callback when swiping right */
  onSwipeRight?: () => void
  /** Callback when swiping up */
  onSwipeUp?: () => void
  /** Callback when swiping down */
  onSwipeDown?: () => void
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  startedFromLeftEdge: boolean
  startedFromRightEdge: boolean
}

/**
 * useSwipeGesture - Hook for detecting swipe gestures
 *
 * @param options - Configuration options for swipe detection
 * @returns ref to attach to the target element
 *
 * @example
 * const swipeRef = useSwipeGesture({
 *   onSwipeRight: () => openSidebar(),
 *   onSwipeLeft: () => closeSidebar(),
 *   requireLeftEdge: true,
 * })
 *
 * return <div ref={swipeRef}>...</div>
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  options: SwipeGestureOptions
) {
  const {
    threshold = 50,
    maxTime = 300,
    edgeZone = 30,
    requireLeftEdge = false,
    requireRightEdge = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options

  const elementRef = useRef<T>(null)
  const touchStateRef = useRef<TouchState | null>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return

      const viewportWidth = window.innerWidth

      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        startedFromLeftEdge: touch.clientX <= edgeZone,
        startedFromRightEdge: touch.clientX >= viewportWidth - edgeZone,
      }
    },
    [edgeZone]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const touchState = touchStateRef.current
      if (!touchState) return

      const touch = e.changedTouches[0]
      if (!touch) return

      const deltaX = touch.clientX - touchState.startX
      const deltaY = touch.clientY - touchState.startY
      const deltaTime = Date.now() - touchState.startTime

      // Reset touch state
      touchStateRef.current = null

      // Check time constraint
      if (deltaTime > maxTime) return

      // Determine swipe direction
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Must be primarily horizontal or vertical
      if (absX < threshold && absY < threshold) return

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right
          if (requireLeftEdge && !touchState.startedFromLeftEdge) return
          onSwipeRight?.()
        } else {
          // Swipe left
          if (requireRightEdge && !touchState.startedFromRightEdge) return
          onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    },
    [threshold, maxTime, requireLeftEdge, requireRightEdge, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  return elementRef
}

/**
 * useEdgeSwipe - Simplified hook for edge-to-open patterns
 *
 * @param onOpen - Callback when swiping from left edge
 * @param onClose - Callback when swiping left to close
 *
 * @example
 * const { containerRef, sidebarRef } = useEdgeSwipe(
 *   () => setOpen(true),
 *   () => setOpen(false)
 * )
 */
export function useEdgeSwipe<T extends HTMLElement = HTMLElement>(
  onOpen: () => void,
  onClose: () => void
) {
  const containerRef = useSwipeGesture<T>({
    onSwipeRight: onOpen,
    requireLeftEdge: true,
    threshold: 50,
  })

  const sidebarRef = useSwipeGesture<T>({
    onSwipeLeft: onClose,
    threshold: 50,
  })

  return { containerRef, sidebarRef }
}
