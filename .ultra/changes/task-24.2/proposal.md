# Task 24.2: Enhance MainLayout Bottom Navigation

## Overview

Improve mobile navigation with WCAG-compliant touch targets, safe area support for notched devices, enhanced visual indicators, and swipe gesture support.

## Rationale

- Current touch targets (~32px) don't meet WCAG 2.5.5 (44px minimum)
- iPhone X+ users need safe-area-inset-bottom support
- Active state needs stronger visual indicator
- Swipe gesture improves mobile UX for sidebar access

## Current Issues

1. Bottom nav touch targets are `px-3 py-2` (~32px height)
2. No `safe-area-inset-bottom` for notched devices
3. Active state only has color change (no visual indicator)
4. Header sidebar toggle calls wrong function (`toggleSidebar` instead of `toggleMobileMenu`)
5. No swipe gesture support for sidebar

## Acceptance Criteria

- [ ] All touch targets >= 44x44px
- [ ] Bottom nav respects safe-area-inset-bottom
- [ ] Active nav item has clear visual indicator (dot/underline)
- [ ] Sidebar can be opened with swipe gesture
- [ ] Header actions accessible on mobile

## Implementation Plan

### Files to Modify
- `src/components/layout/MainLayout.tsx` - Main layout component
- `src/hooks/useSwipeGesture.ts` - New hook for swipe detection

### Files to Create
- `src/__tests__/components/layout/MainLayout.test.tsx` - Tests

## Status: Complete

Started: 2025-12-30
Completed: 2025-12-30

### Test Results
- 15 tests passing
- Build successful

### Implementation Summary
- Added 44px minimum touch targets to all interactive elements
- Added safe-area-inset-bottom for notched devices (iPhone X+)
- Added visual active indicator (dot) on bottom nav
- Fixed header toggle bug (now correctly opens mobile menu)
- Added swipe gesture support (right swipe from edge to open, left swipe to close)
- Added focus management for accessibility
