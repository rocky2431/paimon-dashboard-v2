import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MainLayout from '../../../components/layout/MainLayout'

// Mock useBreakpoint hook
vi.mock('../../../hooks/useBreakpoint', () => ({
  useBreakpoint: () => 'xs',
  useResponsive: () => ({
    breakpoint: 'xs',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  }),
}))

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

describe('MainLayout Mobile Navigation', () => {
  describe('Touch Targets (WCAG 2.5.5 Compliance)', () => {
    it('bottom nav items should have minimum 44x44px touch target classes', () => {
      renderWithRouter(<MainLayout />)

      // Find bottom navigation links
      const bottomNav = screen.getByRole('navigation', { name: /bottom navigation/i })
      const navLinks = bottomNav.querySelectorAll('a')

      navLinks.forEach((link) => {
        // Check for min-w-[44px] and min-h-[44px] classes (Tailwind)
        expect(link.className).toMatch(/min-w-\[44px\]/)
        expect(link.className).toMatch(/min-h-\[44px\]/)
      })
    })

    it('mobile sidebar toggle button should have minimum 44x44px touch target classes', () => {
      renderWithRouter(<MainLayout />)

      const toggleButton = screen.getByLabelText(/toggle sidebar/i)

      // Check for min-w-[44px] and min-h-[44px] classes (Tailwind)
      expect(toggleButton.className).toMatch(/min-w-\[44px\]/)
      expect(toggleButton.className).toMatch(/min-h-\[44px\]/)
    })
  })

  describe('Safe Area Insets', () => {
    it('bottom nav should have safe-area-inset-bottom padding', () => {
      renderWithRouter(<MainLayout />)

      const bottomNav = screen.getByRole('navigation', { name: /bottom navigation/i })

      // Check for safe area class or style
      expect(bottomNav.className).toMatch(/pb-safe|safe-area|env\(safe-area-inset-bottom\)/i)
    })

    it('main content should have bottom padding for bottom nav on mobile', () => {
      renderWithRouter(<MainLayout />)

      const mainContent = screen.getByRole('main')

      // On mobile, main content needs bottom padding to avoid bottom nav overlap
      expect(mainContent.className).toMatch(/pb-|padding-bottom/i)
    })
  })

  describe('Active State Indicator', () => {
    it('active nav item should have visual indicator (dot or underline)', () => {
      renderWithRouter(<MainLayout />, { route: '/' })

      const bottomNav = screen.getByRole('navigation', { name: /bottom navigation/i })
      const activeLink = bottomNav.querySelector('[aria-current="page"]')

      expect(activeLink).toBeTruthy()

      // Should have a visual indicator element (dot, underline, or distinct background)
      const indicator = activeLink?.querySelector('[data-indicator]') ||
        activeLink?.classList.contains('active-indicator') ||
        activeLink?.className.match(/before:|after:|indicator/)

      expect(indicator).toBeTruthy()
    })

    it('inactive nav items should not have visual indicator', () => {
      renderWithRouter(<MainLayout />, { route: '/' })

      const bottomNav = screen.getByRole('navigation', { name: /bottom navigation/i })
      const inactiveLinks = bottomNav.querySelectorAll('a:not([aria-current="page"])')

      inactiveLinks.forEach((link) => {
        const indicator = link.querySelector('[data-indicator]')
        expect(indicator).toBeFalsy()
      })
    })
  })

  describe('Mobile Sidebar Header Toggle', () => {
    it('header toggle button should open mobile sidebar (not collapse desktop)', () => {
      renderWithRouter(<MainLayout />)

      const toggleButton = screen.getByLabelText(/toggle sidebar/i)
      fireEvent.click(toggleButton)

      // Mobile sidebar should be visible
      const mobileSidebar = screen.getByRole('complementary', { name: /mobile navigation/i })
      expect(mobileSidebar).toBeVisible()
      expect(mobileSidebar.className).toContain('translate-x-0')
    })

    it('should close mobile sidebar when clicking overlay', async () => {
      renderWithRouter(<MainLayout />)

      // Open sidebar first
      const toggleButton = screen.getByLabelText(/toggle sidebar/i)
      fireEvent.click(toggleButton)

      // Click overlay to close
      const overlay = document.querySelector('[class*="bg-black"]')
      expect(overlay).toBeTruthy()

      fireEvent.click(overlay!)

      await waitFor(() => {
        const mobileSidebar = screen.getByRole('complementary', { name: /mobile navigation/i })
        expect(mobileSidebar.className).toContain('-translate-x-full')
      })
    })
  })

  describe('Swipe Gesture Support', () => {
    const simulateSwipe = (element: Element, startX: number, endX: number) => {
      fireEvent.touchStart(element, {
        touches: [{ clientX: startX, clientY: 100 }],
      })
      fireEvent.touchMove(element, {
        touches: [{ clientX: endX, clientY: 100 }],
      })
      fireEvent.touchEnd(element, {
        changedTouches: [{ clientX: endX, clientY: 100 }],
      })
    }

    it('should open sidebar with right swipe from left edge', async () => {
      renderWithRouter(<MainLayout />)

      const mainContent = screen.getByRole('main')

      // Simulate swipe right from left edge (0 -> 100px)
      simulateSwipe(mainContent, 0, 100)

      await waitFor(() => {
        const mobileSidebar = screen.getByRole('complementary', { name: /mobile navigation/i })
        expect(mobileSidebar.className).toContain('translate-x-0')
      })
    })

    it('should close sidebar with left swipe', async () => {
      renderWithRouter(<MainLayout />)

      // Open sidebar first
      const toggleButton = screen.getByLabelText(/toggle sidebar/i)
      fireEvent.click(toggleButton)

      const mobileSidebar = screen.getByRole('complementary', { name: /mobile navigation/i })

      // Simulate swipe left (200 -> 50px)
      simulateSwipe(mobileSidebar, 200, 50)

      await waitFor(() => {
        expect(mobileSidebar.className).toContain('-translate-x-full')
      })
    })

    it('should not trigger swipe if not starting from edge', async () => {
      renderWithRouter(<MainLayout />)

      const mainContent = screen.getByRole('main')

      // Simulate swipe starting from middle of screen
      simulateSwipe(mainContent, 200, 300)

      // Sidebar should remain closed
      const mobileSidebar = screen.getByRole('complementary', { name: /mobile navigation/i })
      expect(mobileSidebar.className).toContain('-translate-x-full')
    })
  })

  describe('Header Actions Accessibility', () => {
    it('user menu should be accessible on mobile', () => {
      renderWithRouter(<MainLayout />)

      const userMenuTrigger = screen.getByRole('button', { name: /user/i }) ||
        document.querySelector('[aria-haspopup="menu"]')

      expect(userMenuTrigger).toBeTruthy()
      expect(userMenuTrigger).toBeVisible()
    })

    it('should have proper focus management on mobile sidebar', async () => {
      renderWithRouter(<MainLayout />)

      const toggleButton = screen.getByLabelText(/toggle sidebar/i)
      fireEvent.click(toggleButton)

      // Focus should move to sidebar or close button
      await waitFor(() => {
        const closeButton = screen.getByLabelText(/close sidebar/i)
        // Either close button is focused or sidebar container
        expect(document.activeElement === closeButton ||
          document.activeElement?.closest('[role="complementary"]')).toBeTruthy()
      })
    })
  })
})

describe('MainLayout Responsive Behavior', () => {
  it('should show bottom nav on mobile only', () => {
    renderWithRouter(<MainLayout />)

    const bottomNav = screen.getByRole('navigation', { name: /bottom navigation/i })
    // Should have lg:hidden class
    expect(bottomNav.className).toContain('lg:hidden')
  })

  it('should hide desktop sidebar on mobile', () => {
    renderWithRouter(<MainLayout />)

    const desktopSidebar = screen.queryByRole('complementary', { name: /main navigation/i })
    // Should have hidden lg:block
    expect(desktopSidebar?.className).toContain('hidden')
    expect(desktopSidebar?.className).toContain('lg:block')
  })
})
