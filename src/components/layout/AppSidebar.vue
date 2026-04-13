<template>
  <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed, dark: appStore.isDarkMode, 'header-hidden': !headerVisible }">
    <div class="sidebar-content">
      <!-- 用户信息 -->
      <div class="user-info" v-if="!appStore.sidebarCollapsed">
        <el-avatar :size="48" :src="appStore.userProfile?.avatar">
          <el-icon size="24">
            <User />
          </el-icon>
        </el-avatar>
        <div class="user-details">
          <h3 class="user-name">{{ appStore.userProfile?.name || '访客用户' }}</h3>
          <p class="user-role">中医诊疗系统</p>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path, collapsed: appStore.sidebarCollapsed }"
        >
          <el-icon size="20">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text" v-if="!appStore.sidebarCollapsed">{{ $t(`nav.${item.key}`) }}</span>
          <el-badge 
            v-if="item.badge && !appStore.sidebarCollapsed" 
            :value="item.badge" 
            class="nav-badge"
          />
        </router-link>
      </nav>
      
      <!-- 快捷功能 -->
      <div class="quick-actions" v-if="!appStore.sidebarCollapsed">
        <h4 class="actions-title">快捷功能</h4>
        <div class="action-buttons">
          <el-button 
            v-for="action in quickActions" 
            :key="action.key"
            :type="action.type"
            :icon="action.icon"
            size="small"
            class="action-btn"
            @click="handleQuickAction(action.key)"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats" v-if="!appStore.sidebarCollapsed">
        <div class="stat-item">
          <div class="stat-value">{{ diagnosisStore.recordsCount }}</div>
          <div class="stat-label">诊断记录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ knowledgeCount }}</div>
          <div class="stat-label">知识条目</div>
        </div>
      </div>
    </div>
    
    <!-- 收起/展开按钮 -->
    <div class="sidebar-footer">
      <el-button 
        circle 
        size="small"
        class="collapse-btn"
        @click="appStore.toggleSidebar"
      >
        <el-icon size="16">
          <component :is="collapseIcon" />
        </el-icon>
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useDiagnosisStore } from '@/stores/diagnosis'
import {
  House,
  DocumentCopy,
  Document,
  User,
  Plus,
  Search,
  TrendCharts,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const diagnosisStore = useDiagnosisStore()

// 注入头部显示状态
const headerVisible = inject('headerVisible', ref(true))

const knowledgeCount = ref(156)

const menuItems = [
  { path: '/', key: 'home', icon: 'House' },
  { path: '/diagnosis', key: 'diagnosis', icon: 'MostlyCloudy', badge: 1 },
  { path: '/records', key: 'records', icon: 'DocumentCopy' },
  { path: '/knowledge', key: 'knowledge', icon: 'Document' },
  { path: '/profile', key: 'profile', icon: 'User' }
]

const quickActions = [
  { key: 'diagnosis', label: '开始诊断', type: 'primary', icon: Plus },
  { key: 'search', label: '知识搜索', type: 'info', icon: Search },
  { key: 'stats', label: '数据统计', type: 'success', icon: TrendCharts }
]

const collapseIcon = computed(() => 
  appStore.sidebarCollapsed ? ArrowRight : ArrowLeft
)

const handleQuickAction = (key: string) => {
  switch (key) {
    case 'diagnosis':
      router.push('/diagnosis')
      break
    case 'search':
      router.push('/knowledge')
      break
    case 'stats':
      router.push('/profile')
      break
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(139, 69, 19, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 999;
}

.app-sidebar.collapsed {
  width: 64px;
}

.app-sidebar.dark {
  background: rgba(30, 30, 30, 0.95);
  border-right-color: rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(210, 105, 30, 0.1) 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 4px 0;
}

.user-role {
  font-size: 0.8rem;
  color: var(--tcm-secondary);
  margin: 0;
}

.sidebar-nav {
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--tcm-dark);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(139, 69, 19, 0.1);
  transform: translateX(4px);
}

.nav-item.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-medium);
}

.nav-item.collapsed {
  justify-content: center;
  padding: 12px;
}

.nav-text {
  flex: 1;
}

.nav-badge {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.quick-actions {
  margin-bottom: 24px;
}

.actions-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tcm-secondary);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: rgba(245, 230, 211, 0.5);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--tcm-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--tcm-secondary);
  margin-top: 4px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  display: flex;
  justify-content: center;
}

.collapse-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
}

.collapse-btn:hover {
  transform: scale(1.1);
}

/* 头部隐藏时的侧边栏动画 */
.app-sidebar.header-hidden {
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.app-sidebar.header-hidden.collapsed {
  transform: translateX(0);
}

/* 头部显示时的侧边栏动画 */
.app-sidebar:not(.header-hidden) {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .app-sidebar {
    display: none;  /* 移动端完全隐藏侧边栏 */
  }
}
</style>