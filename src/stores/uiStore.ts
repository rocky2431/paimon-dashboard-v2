import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
export type Theme = 'light' | 'dark' | 'system'

export interface UIState {
  // Theme
  theme: Theme

  // Sidebar
  sidebarCollapsed: boolean
  sidebarWidth: number

  // Mobile
  mobileMenuOpen: boolean
  isMobile: boolean

  // Layout
  layoutDensity: 'compact' | 'default' | 'spacious'

  // Preferences
  showNotifications: boolean
  autoHideSidebar: boolean
  reducedMotion: boolean

  // Actions
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  setIsMobile: (isMobile: boolean) => void
  setLayoutDensity: (density: 'compact' | 'default' | 'spacious') => void
  setShowNotifications: (show: boolean) => void
  setAutoHideSidebar: (autoHide: boolean) => void
  setReducedMotion: (reduced: boolean) => void

  // Reset
  resetUI: () => void
}

// Default values
const defaultSidebarWidth = 240
const defaultTheme: Theme = 'system'
const defaultLayoutDensity = 'default'

// UI Store
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: defaultTheme,
        sidebarCollapsed: false,
        sidebarWidth: defaultSidebarWidth,
        mobileMenuOpen: false,
        isMobile: false,
        layoutDensity: defaultLayoutDensity,
        showNotifications: true,
        autoHideSidebar: false,
        reducedMotion: false,

        // Theme actions
        setTheme: (theme: Theme) => {
          set(
            { theme },
            false,
            'ui/setTheme'
          )

          // Apply theme to document
          if (typeof document !== 'undefined') {
            const root = document.documentElement

            // Remove existing theme classes
            root.classList.remove('light', 'dark')

            // Apply new theme
            if (theme === 'system') {
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              root.classList.add(systemTheme)
            } else {
              root.classList.add(theme)
            }
          }
        },

        // Sidebar actions
        toggleSidebar: () => {
          set(
            (state) => ({
              sidebarCollapsed: !state.sidebarCollapsed,
            }),
            false,
            'ui/toggleSidebar'
          )
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set(
            { sidebarCollapsed: collapsed },
            false,
            'ui/setSidebarCollapsed'
          )
        },

        setSidebarWidth: (width: number) => {
          set(
            { sidebarWidth: Math.max(180, Math.min(400, width)) },
            false,
            'ui/setSidebarWidth'
          )
        },

        // Mobile actions
        toggleMobileMenu: () => {
          set(
            (state) => ({
              mobileMenuOpen: !state.mobileMenuOpen,
            }),
            false,
            'ui/toggleMobileMenu'
          )
        },

        setMobileMenuOpen: (open: boolean) => {
          set(
            { mobileMenuOpen: open },
            false,
            'ui/setMobileMenuOpen'
          )
        },

        setIsMobile: (isMobile: boolean) => {
          set(
            { isMobile },
            false,
            'ui/setIsMobile'
          )
        },

        // Layout actions
        setLayoutDensity: (density: 'compact' | 'default' | 'spacious') => {
          set(
            { layoutDensity: density },
            false,
            'ui/setLayoutDensity'
          )

          // Apply density class to document
          if (typeof document !== 'undefined') {
            const root = document.documentElement
            root.classList.remove('density-compact', 'density-default', 'density-spacious')
            root.classList.add(`density-${density}`)
          }
        },

        setShowNotifications: (show: boolean) => {
          set(
            { showNotifications: show },
            false,
            'ui/setShowNotifications'
          )
        },

        setAutoHideSidebar: (autoHide: boolean) => {
          set(
            { autoHideSidebar: autoHide },
            false,
            'ui/setAutoHideSidebar'
          )
        },

        setReducedMotion: (reduced: boolean) => {
          set(
            { reducedMotion: reduced },
            false,
            'ui/setReducedMotion'
          )

          // Apply reduced motion preference
          if (typeof document !== 'undefined') {
            const root = document.documentElement
            if (reduced) {
              root.classList.add('reduce-motion')
            } else {
              root.classList.remove('reduce-motion')
            }
          }
        },

        // Reset
        resetUI: () => {
          set(
            {
              theme: defaultTheme,
              sidebarCollapsed: false,
              sidebarWidth: defaultSidebarWidth,
              mobileMenuOpen: false,
              layoutDensity: defaultLayoutDensity,
              showNotifications: true,
              autoHideSidebar: false,
              reducedMotion: false,
            },
            false,
            'ui/reset'
          )
        },
      }),
      {
        name: 'ui-store',
        // Only persist certain fields (exclude isMobile as it's derived)
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarWidth: state.sidebarWidth,
          layoutDensity: state.layoutDensity,
          showNotifications: state.showNotifications,
          autoHideSidebar: state.autoHideSidebar,
          reducedMotion: state.reducedMotion,
        }),
      }
    ),
    {
      name: 'ui-store',
      enabled: import.meta.env.DEV,
    }
  )
)

// Selectors for optimized re-renders
export const useTheme = () => useUIStore((state) => state.theme)
export const useSidebarState = () =>
  useUIStore((state) => ({
    collapsed: state.sidebarCollapsed,
    width: state.sidebarWidth,
    autoHide: state.autoHideSidebar,
  }))
export const useMobileState = () =>
  useUIStore((state) => ({
    isMobile: state.isMobile,
    menuOpen: state.mobileMenuOpen,
  }))
export const useLayoutDensity = () => useUIStore((state) => state.layoutDensity)
export const useNotificationsEnabled = () => useUIStore((state) => state.showNotifications)
export const useReducedMotion = () => useUIStore((state) => state.reducedMotion)

// Combined selectors
export const useUIState = () =>
  useUIStore((state) => ({
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed,
    sidebarWidth: state.sidebarWidth,
    mobileMenuOpen: state.mobileMenuOpen,
    isMobile: state.isMobile,
    layoutDensity: state.layoutDensity,
    showNotifications: state.showNotifications,
    autoHideSidebar: state.autoHideSidebar,
    reducedMotion: state.reducedMotion,
  }))

export const useUIActions = () =>
  useUIStore((state) => ({
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setSidebarWidth: state.setSidebarWidth,
    toggleMobileMenu: state.toggleMobileMenu,
    setMobileMenuOpen: state.setMobileMenuOpen,
    setIsMobile: state.setIsMobile,
    setLayoutDensity: state.setLayoutDensity,
    setShowNotifications: state.setShowNotifications,
    setAutoHideSidebar: state.setAutoHideSidebar,
    setReducedMotion: state.setReducedMotion,
    resetUI: state.resetUI,
  }))