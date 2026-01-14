import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system' | 'neutral'
  accentColor: string
  commandPaletteOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system' | 'neutral') => void
  setAccentColor: (color: string) => void
  toggleCommandPalette: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      accentColor: '25 95% 53%', // Default Orange
      commandPaletteOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        const root = document.documentElement
        root.classList.remove('dark', 'neutral')
        
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'neutral') {
          root.classList.add('neutral')
          // Neutral can be considered a dark variant or separate.
          // Usually we want dark text on light, or light text on dark.
          // Let's assume Neutral is a Dark Gray theme, so we check preferences or just force it.
          // Or if it's a light neutral? "Neutral time jo io theme match".
          // Let's make Neutral a "System-like" gray theme.
          // For now, I will treat it as a distinct class that overrides colors.
          root.classList.add('dark') // Inherit dark mode text colors suitable for dark gray
        } else if (theme === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark')
          }
        }
      },
      setAccentColor: (color) => {
        set({ accentColor: color })
        document.documentElement.style.setProperty('--primary', color)
        document.documentElement.style.setProperty('--ring', color)
      },
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        accentColor: state.accentColor,
      }),
    }
  )
)
