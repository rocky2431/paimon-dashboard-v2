# Task 24.3: Create DataTable Mobile Card Variant

## Overview

Add CardView mode to DataTable component that automatically activates on mobile viewports, providing a touch-friendly card-based layout while preserving all table functionality.

## Rationale

- Tables are difficult to read on narrow mobile screens
- Card layout provides better information hierarchy on mobile
- Touch-friendly design improves UX on mobile devices
- Must maintain sorting, filtering, and pagination functionality

## Acceptance Criteria

- [ ] DataTable renders as cards on mobile (<768px)
- [ ] Card layout shows key columns with proper hierarchy
- [ ] Sort/filter controls work in mobile view
- [ ] Pagination works in card mode
- [ ] Row actions accessible via card menu

## Implementation Plan

### New Props for DataTable
```typescript
interface DataTableProps<TData> {
  // ... existing props
  viewMode?: 'auto' | 'table' | 'card'  // default: 'auto'
  cardConfig?: {
    titleColumn?: string      // Column to use as card title
    subtitleColumn?: string   // Column to use as subtitle
    imageColumn?: string      // Optional image column
    priorityColumns?: string[] // Columns to show prominently
    hideColumns?: string[]    // Columns to hide in card view
  }
}
```

### New Components
- `DataTableCardView` - Card-based rendering component
- `DataTableCard` - Individual card component with actions menu

### Auto-detection Logic
- Use `useBreakpoint` from Task 24.1
- Switch to cards when `breakpoint` is 'xs' or 'sm' (< md/768px)
- Allow manual override via `viewMode` prop

## Files to Modify
- `src/components/ui/DataTable.tsx` - Add card mode support

## Files to Create
- `src/components/ui/DataTableCardView.tsx` - Card view component
- `src/__tests__/components/DataTableCardView.test.tsx` - Tests

## Status: Complete

Started: 2025-12-30
Completed: 2025-12-30

### Test Results
- 28 tests passing
- Build successful

### Implementation Summary
- Added viewMode prop ('auto' | 'table' | 'card') to DataTable
- Created DataTableCardView component for mobile card rendering
- Auto-detection uses useResponsive hook from Task 24.1
- Card layout shows configurable title, subtitle, and priority columns
- Sorting via dropdown control in card view
- Search/filter preserved in card view
- Pagination works in card view
- Row selection with checkboxes on cards
- Actions menu on each card with proper accessibility
