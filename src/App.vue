<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref, provide } from 'vue'
import { useAppStore } from '@/stores/app'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const appStore = useAppStore()

// 管理头部显示状态
const isHeaderVisible = ref(true)
provide('headerVisible', isHeaderVisible)

onMounted(() => {
  appStore.initialize()
})
</script>

<template>
  <div id="app" class="app-container">
    <AppHeader />
    
  <div class="main-layout" :class="{ dark: appStore.isDarkMode }">
      <AppSidebar />
      
      <main class="main-content" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed , dark: appStore.isDarkMode }">
        <div class="content-wrapper">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </main>
    </div>
    
    <AppFooter />
    
    <!-- 全局加载遮罩 -->
    <LoadingSpinner v-if="appStore.isLoading" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.main-layout.dark {
  background: linear-gradient(135deg, #2f2f2f 0%, #3a3a3a 100%);
}

.main-content {
  flex: 1 1 calc(100% - 260px);
  width: calc(100% - 260px);
  margin-left: 260px;
  min-width: 0;
  transition: margin-left 0.3s ease, width 0.3s ease, flex-basis 0.3s ease;
  background: linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 100%);
  min-height: calc(100vh - 120px);
}
.main-content.dark{
  background: linear-gradient(135deg, #5c5b5a 0%, #636160 100%);
}
.main-content.sidebar-collapsed {
  margin-left: 64px;
  width: calc(100% - 64px);
  flex-basis: calc(100% - 64px);
}

.content-wrapper {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-bottom: 60px;
    width: 100%;
    flex-basis: 100%;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  /* 移动端隐藏侧边栏 */
  .main-layout {
    position: relative;
  }
  
  .main-layout > .app-sidebar {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .content-wrapper {
    padding: 12px;
  }
}
</style>
