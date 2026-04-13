import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState, UserProfile } from '@/types/tcm'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isLoading = ref(false)
  const currentLanguage = ref<'zh-CN' | 'en'>('zh-CN')
  const theme = ref<'light' | 'dark' | 'auto'>('light')
  const sidebarCollapsed = ref(true)
  const notifications = ref(true)
  
  // 用户信息
  const userProfile = ref<UserProfile | null>(null)
  
  // 计算属性
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })
  
  const isMobile = computed(() => {
    return window.innerWidth <= 768
  })
  
  // 方法
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  
  const setLanguage = (lang: 'zh-CN' | 'en') => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }
  
  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }
  
  const setDarkMode = (dark: boolean) => {
    theme.value = dark ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }
  
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }
  
  const toggleNotifications = () => {
    notifications.value = !notifications.value
    localStorage.setItem('notifications', String(notifications.value))
  }
  
  const setUserProfile = (profile: UserProfile | null) => {
    userProfile.value = profile
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile))
    } else {
      localStorage.removeItem('userProfile')
    }
  }
  
  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement
    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
  
  // 初始化
  const initialize = () => {
    // 从localStorage恢复设置
    const savedLanguage = localStorage.getItem('language') as 'zh-CN' | 'en'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto'
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
    const savedNotifications = localStorage.getItem('notifications')
    const savedUserProfile = localStorage.getItem('userProfile')
    
    if (savedLanguage) {
      currentLanguage.value = savedLanguage
    }
    
    if (savedTheme) {
      theme.value = savedTheme
    }
    
    if (savedSidebarCollapsed) {
      sidebarCollapsed.value = savedSidebarCollapsed === 'true'
    }
    
    if (savedNotifications) {
      notifications.value = savedNotifications === 'true'
    }
    
    if (savedUserProfile) {
      try {
        userProfile.value = JSON.parse(savedUserProfile)
      } catch (error) {
        console.error('Failed to parse user profile:', error)
      }
    }
    
    applyTheme()
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyTheme()
      }
    })
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      // 响应式处理会在计算属性中自动更新
    })
  }
  
  // 重置状态
  const reset = () => {
    isLoading.value = false
    currentLanguage.value = 'zh-CN'
    theme.value = 'light'
    sidebarCollapsed.value = false
    notifications.value = true
    userProfile.value = null
    localStorage.clear()
    applyTheme()
  }
  
  return {
    // 状态
    isLoading,
    currentLanguage,
    theme,
    sidebarCollapsed,
    notifications,
    userProfile,
    
    // 计算属性
    isDarkMode,
    isMobile,
    
    // 方法
    setLoading,
    setLanguage,
    setTheme,
    setDarkMode,
    toggleSidebar,
    toggleNotifications,
    setUserProfile,
    initialize,
    reset
  }
})