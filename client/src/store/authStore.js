import { create } from 'zustand'
import { getMe } from '../api/auth'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // ── DARK MODE ──────────────────────────────────────────────
  // Read saved theme from localStorage, default to 'dark'
  theme: localStorage.getItem('theme') || 'dark',

  // Call this to flip between 'dark' and 'light'
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      // Save choice so it survives page refresh
      localStorage.setItem('theme', next)
      // Apply or remove the 'light' class on <html> element
      document.documentElement.classList.toggle('light', next === 'light')
      return { theme: next }
    }),
  // ───────────────────────────────────────────────────────────

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // ── DARK MODE ──────────────────────────────────────────────
    // Also restore theme on app boot so it applies immediately
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.documentElement.classList.toggle('light', savedTheme === 'light')
    // ───────────────────────────────────────────────────────────

    try {
      const res = await getMe()
      set({
        user: res.data.user,
        token,
        isAuthenticated: true,
      })
    } catch (err) {
      localStorage.clear()
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))

export default useAuthStore