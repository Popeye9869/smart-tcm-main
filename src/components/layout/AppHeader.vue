<template>
  <header class="app-header" :class="{ 'dark': appStore.isDarkMode, 'hidden': !isHeaderVisible }">
    <div class="header-content">
      <!-- 左侧 Logo 和标题 -->
      <div class="header-left">
        <div class="logo">
          <el-icon size="32" color="var(--tcm-primary)">
            <MostlyCloudy />
          </el-icon>
        </div>
        <div class="brand">
          <h1 class="brand-title">{{ $t('nav.title') || '智能中医' }}</h1>
          <p class="brand-subtitle">AI-powered TCM System</p>
        </div>
      </div>
      
      <!-- 中间导航 -->
      <nav class="header-nav hidden-mobile">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <el-icon size="18">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ $t(`nav.${item.key}`) }}</span>
        </router-link>
      </nav>
      
      <!-- 右侧操作区 -->
      <div class="header-right">
        <!-- 搜索框 -->
        <div class="search-box hidden-mobile">
          <el-input
            v-model="searchQuery"
            placeholder="搜索中医知识..."
            :prefix-icon="Search"
            size="small"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        
        <!-- 语言切换 -->
        <el-dropdown @command="handleLanguageChange" trigger="click">
          <el-button circle size="small">
            <span size="16" style="font-size: 12px;">
              文
            </span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN" :class="{ active: appStore.currentLanguage === 'zh-CN' }">
                简体中文
              </el-dropdown-item>
              <el-dropdown-item command="en" :class="{ active: appStore.currentLanguage === 'en' }">
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 主题切换 -->
        <el-button circle size="small" @click="toggleTheme">
          <el-icon size="16">
            <component :is="themeIcon" />
          </el-icon>
        </el-button>
        
        <!-- 通知 -->
        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
          <el-button circle size="small" @click="showNotifications">
            <el-icon size="16">
              <Bell />
            </el-icon>
          </el-button>
        </el-badge>
        
        <!-- 用户头像 -->
        <el-dropdown trigger="click" @command="handleUserAction">
          <el-avatar 
            :size="36" 
            :src="appStore.userProfile?.avatar"
            :class="{ 'cursor-pointer': true }"
          >
            <el-icon size="20">
              <User />
            </el-icon>
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" :icon="User">
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings" :icon="Setting">
                设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout" :icon="SwitchButton">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 移动端菜单按钮 -->
        <el-button 
          class="mobile-menu-btn hidden-desktop" 
          :icon="Menu" 
          circle 
          size="small"
          @click="toggleMobileMenu"
        />
      </div>
    </div>
    
    <!-- 移动端导航菜单 -->
    <transition name="slide-down">
      <nav v-if="showMobileMenu" class="mobile-nav hidden-desktop">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          :class="{ active: $route.path === item.path }"
          @click="showMobileMenu = false"
        >
          <el-icon size="20">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ $t(`nav.${item.key}`) }}</span>
        </router-link>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import {
  MostlyCloudy,
  House,
  DocumentCopy,
  Document,
  User,
  Search,
  Bell,
  Setting,
  SwitchButton,
  Menu,
  Sunny,
  Moon,
  Monitor
} from '@element-plus/icons-vue'

const router = useRouter()
const { locale } = useI18n()
const appStore = useAppStore()

const searchQuery = ref('')
const showMobileMenu = ref(false)
const notificationCount = ref(2)
const lastScrollY = ref(0)

// 注入共享的头部显示状态
const isHeaderVisible = inject('headerVisible', ref(true))

const navItems = [
  { path: '/', key: 'home', icon: 'House' },
  { path: '/diagnosis', key: 'diagnosis', icon: 'MostlyCloudy' },
  { path: '/records', key: 'records', icon: 'DocumentCopy' },
  { path: '/knowledge', key: 'knowledge', icon: 'Document' },
  { path: '/profile', key: 'profile', icon: 'User' }
]

const themeIcon = computed(() => {
  switch (appStore.theme) {
    case 'dark':
      return Moon
    case 'light':
      return Sunny
    default:
      return Monitor
  }
})

const handleLanguageChange = (lang: string) => {
  appStore.setLanguage(lang as 'zh-CN' | 'en')
  locale.value = lang
}

const toggleTheme = () => {
  const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(appStore.theme)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  appStore.setTheme(nextTheme || 'light') // 如果 nextTheme 为 undefined，默认使用 'light' 主题
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/knowledge',
      query: { search: searchQuery.value.trim() }
    })
  }
}

const showNotifications = () => {
  // 显示通知弹窗
  console.log('显示通知')
}

const handleUserAction = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      appStore.setUserProfile(null)
      router.push('/login')
      break
  }
}

// 滚动处理函数
let scrollTimeout: number | null = null
const handleScroll = () => {
  // 清除之前的定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  // 延迟执行，优化性能
  scrollTimeout = window.setTimeout(() => {
    const currentScrollY = window.scrollY
    
    // 当向上滚动或快到底部时显示头部，向下滚动超过50px时隐藏头部
    if (currentScrollY < lastScrollY.value || currentScrollY > document.documentElement.scrollHeight - window.innerHeight - 380) {
      // 向上滚动或快到底部，显示头部
      isHeaderVisible.value = true
    } else if (currentScrollY > lastScrollY.value && currentScrollY > 50) {
      // 向下滚动超过50px，隐藏头部
      isHeaderVisible.value = false
    }
    
    lastScrollY.value = currentScrollY
  }, 50)
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.app-header.hidden {
  transform: translateY(-100%);
}

.app-header.dark {
  background: rgba(30, 30, 30, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: 12px;
  animation: float 3s ease-in-out infinite;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.8rem;
  color: var(--tcm-secondary);
  margin: 0;
  line-height: 1;
}

.header-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--tcm-dark);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(139, 69, 19, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-medium);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  width: 200px;
}

.mobile-menu-btn {
  margin-left: 8px;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  padding: 16px;
  gap: 8px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--tcm-dark);
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-item:hover {
  background: rgba(139, 69, 19, 0.1);
}

.mobile-nav-item.active {
  background: var(--gradient-primary);
  color: white;
}


/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .header-content {
    padding: 8px 12px;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .search-box {
    width: 150px;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 480px) {
  .header-content {
    padding: 6px 10px;
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .header-right {
    gap: 6px;
  }
  
  .header-left {
    gap: 10px;
  }
  
  .mobile-menu-btn {
    margin-left: 4px;
  }
  .hidden-mobile{
    display: none;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>