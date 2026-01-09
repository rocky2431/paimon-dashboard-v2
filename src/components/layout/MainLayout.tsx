import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

const navigation = [
  { title: 'Dashboard', href: '/', icon: '📊' },
  { title: 'Redemptions', href: '/redemptions', icon: '💰' },
  { title: 'Risk', href: '/risk', icon: '⚠️' },
  { title: 'Rebalance', href: '/rebalance', icon: '⚖️' },
  { title: 'Reports', href: '/reports', icon: '📋' },
  { title: 'Settings', href: '/settings', icon: '⚙️' },
]

interface MainLayoutProps {
  children?: React.ReactNode
  hideNavigation?: boolean
}

export default function MainLayout({ children, hideNavigation = false }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const mainContentRef = useRef<HTMLElement>(null)
  const mobileSidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Swipe gesture state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const SWIPE_THRESHOLD = 50
  const EDGE_ZONE = 30
  const MAX_SWIPE_TIME = 300

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen)
  }, [mobileMenuOpen])

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  // Focus management for mobile sidebar
  useEffect(() => {
    if (mobileMenuOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [mobileMenuOpen])

  // Swipe gesture handlers for main content (open sidebar)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    const startedFromLeftEdge = touchStartRef.current.x <= EDGE_ZONE

    touchStartRef.current = null

    // Check if it's a valid swipe
    if (deltaTime > MAX_SWIPE_TIME) return
    if (Math.abs(deltaY) > Math.abs(deltaX)) return // Not horizontal
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

    // Swipe right from left edge -> open sidebar
    if (deltaX > 0 && startedFromLeftEdge && !mobileMenuOpen) {
      openMobileMenu()
    }
  }, [mobileMenuOpen, openMobileMenu])

  // Swipe gesture handlers for sidebar (close sidebar)
  const handleSidebarTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const handleSidebarTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    touchStartRef.current = null

    // Check if it's a valid swipe
    if (deltaTime > MAX_SWIPE_TIME) return
    if (Math.abs(deltaY) > Math.abs(deltaX)) return // Not horizontal
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

    // Swipe left -> close sidebar
    if (deltaX < 0 && mobileMenuOpen) {
      closeMobileMenu()
    }
  }, [mobileMenuOpen, closeMobileMenu])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      {/* Header */}
      {!hideNavigation && (
        <header
          role="banner"
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left section - Logo and sidebar toggle */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu toggle - min 44x44px touch target */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="min-w-[44px] min-h-[44px] p-2 lg:hidden flex items-center justify-center"
                aria-label="Toggle sidebar"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>

              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Paimon Admin
                </span>
              </Link>
            </div>

            {/* Right section - User menu with 44px touch target */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center"
                    aria-label="User menu"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar - Desktop */}
        {!hideNavigation && (
          <aside
            role="complementary"
            aria-label="Main navigation"
            className={cn(
              "hidden lg:block bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
              sidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Navigation */}
              <nav aria-label="Main navigation" className="flex-1 p-4">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                          isActive(item.href)
                            ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {!sidebarCollapsed && <span>{item.title}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="w-full justify-start min-h-[44px]"
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <svg
                    className={cn(
                      "h-4 w-4 transition-transform",
                      sidebarCollapsed && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
                </Button>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Menu Overlay */}
        {!hideNavigation && mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar with swipe support */}
        {!hideNavigation && (
          <aside
            ref={mobileSidebarRef}
            role="complementary"
            aria-label="Mobile navigation"
            className={cn(
              "lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onTouchStart={handleSidebarTouchStart}
            onTouchEnd={handleSidebarTouchEnd}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Menu
                </span>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="sm"
                  onClick={closeMobileMenu}
                  className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center"
                  aria-label="Close sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              {/* Navigation */}
              <nav aria-label="Mobile navigation" className="flex-1 p-4">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                          isActive(item.href)
                            ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content with swipe support and bottom padding for bottom nav */}
        <main
          id="main-content"
          role="main"
          aria-label="Main content"
          ref={mainContentRef}
          className={cn(
            "flex-1 min-h-0",
            !hideNavigation && "pb-20 lg:pb-0" // Bottom padding for bottom nav on mobile
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={hideNavigation ? "h-full flex items-center justify-center" : "p-6"}>
            {!hideNavigation && (
              <>
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                        Home
                      </Link>
                    </li>
                    {location.pathname !== '/' && (
                      <>
                        <li>
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </li>
                        <li className="font-medium text-gray-900 dark:text-gray-100">
                          {location.pathname.split('/')[1] || 'Dashboard'}
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
              </>
            )}

            {/* Page Content */}
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile with safe area and 44px touch targets */}
      {!hideNavigation && (
        <nav
          role="navigation"
          aria-label="Bottom navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 pb-safe"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around py-1">
            {navigation.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg text-xs transition-colors",
                  isActive(item.href)
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className="text-[10px] leading-tight">{item.title.split(' ')[0]}</span>
                {/* Active indicator dot */}
                {isActive(item.href) && (
                  <span
                    data-indicator="active"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400"
                  />
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
