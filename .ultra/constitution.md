# Project Constitution - Paimon Admin Dashboard

> Last Updated: 2025-12-15
> Version: 1.0.0

## Core Principles

### 1. Specification-Driven Development

**Rule**: All development must trace back to specifications.

- `specs/product.md` defines WHAT to build
- `specs/architecture.md` defines HOW to build
- No features without corresponding user stories
- No technical decisions without architectural rationale

### 2. Backend Integration First

**Rule**: Frontend serves the backend API faithfully.

- API contracts are the source of truth
- No frontend-only business logic
- All data validation mirrors backend validation
- Error handling follows backend error codes

### 3. Component-Driven Development

**Rule**: Build reusable, testable components.

- UI components are presentational only
- Business components encapsulate domain logic
- Pages compose components, not implement logic
- Shared components live in `components/`

### 4. Type Safety

**Rule**: TypeScript strict mode, no `any` escape hatches.

- All API responses must be typed
- Props interfaces for all components
- Zod schemas for runtime validation
- Generic types over type assertions

### 5. Performance Budget

**Rule**: Core Web Vitals are non-negotiable.

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Bundle size budget: 200KB initial, 500KB total

### 6. Test Coverage

**Rule**: Quality gates enforced.

- Overall coverage >= 80%
- Critical paths (auth, forms) = 100%
- E2E tests for all user stories
- No merge without passing tests

## Technical Constraints

### Framework & Libraries

- React 18.x (no class components)
- TypeScript 5.x (strict mode)
- Vite 5.x (ESM only)
- TanStack Query 5.x (server state)
- Zustand 4.x (client state)
- Ant Design 5.x (UI components)

### Coding Standards

- Functions < 50 lines
- Nesting depth < 3 levels
- No duplicate code > 3 lines
- Meaningful variable names
- JSDoc for public APIs

### File Conventions

- PascalCase for components: `RedemptionCard.tsx`
- camelCase for utilities: `formatCurrency.ts`
- kebab-case for routes: `/risk-monitoring`
- Index exports for modules: `components/index.ts`

### Git Workflow

- Branch naming: `feat/task-{id}-{description}`
- Commit convention: Conventional Commits
- No direct commits to main
- Squash merge preferred

## Quality Gates

### Before Commit

- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Prettier formatted
- [ ] Unit tests pass

### Before Merge

- [ ] All CI checks pass
- [ ] Coverage >= 80%
- [ ] No console.log in production code
- [ ] Bundle size within budget
- [ ] Lighthouse score >= 90

### Before Release

- [ ] E2E tests pass
- [ ] Manual QA on staging
- [ ] Performance audit
- [ ] Security audit

## Development Philosophy

### Priority Order

```
User Experience > Code Elegance
Type Safety > Development Speed
Maintainability > Cleverness
Explicit > Implicit
```

### What We DO

- Write self-documenting code
- Handle all error states
- Test edge cases
- Optimize for readability
- Follow established patterns

### What We DON'T

- Premature optimization
- Over-engineering
- Copy-paste without understanding
- Ignore TypeScript errors
- Skip error boundaries

---

**This constitution is binding for all development activities.**
