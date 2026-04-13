<template>
  <div class="loading-overlay" :class="{ 'full-screen': fullScreen }">
    <div class="loading-content">
      <!-- 主加载动画 -->
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-center">
          <el-icon size="32" color="var(--tcm-primary)">
            <MostlyCloudy />
          </el-icon>
        </div>
      </div>
      
      <!-- 加载文字 -->
      <div class="loading-text">
        <h3 class="loading-title">{{ title }}</h3>
        <p class="loading-subtitle">{{ subtitle }}</p>
        <div class="loading-dots">
          <span v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: `${(i - 1) * 0.2}s` }"></span>
        </div>
      </div>
      
      <!-- 进度条（可选） -->
      <div v-if="showProgress" class="loading-progress">
        <el-progress 
          :percentage="progress" 
          :stroke-width="4"
          :show-text="false"
          color="var(--tcm-primary)"
        />
        <span class="progress-text">{{ progress }}%</span>
      </div>
      
      <!-- 取消按钮（可选） -->
      <div v-if="cancellable" class="loading-actions">
        <el-button size="small" @click="handleCancel">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MostlyCloudy } from '@element-plus/icons-vue'

interface Props {
  title?: string
  subtitle?: string
  fullScreen?: boolean
  showProgress?: boolean
  progress?: number
  cancellable?: boolean
}

interface Emits {
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '正在处理中',
  subtitle: '请稍候，系统正在为您分析...',
  fullScreen: true,
  showProgress: false,
  progress: 0,
  cancellable: false
})

const emit = defineEmits<Emits>()

const handleCancel = () => {
  emit('cancel')
}

// 动态文字效果
const dynamicSubtitles = [
  '正在分析症状信息...',
  '正在查询中医知识库...',
  '正在生成诊断结果...',
  '正在推荐治疗方案...',
  '正在优化处方配置...'
]

const currentSubtitleIndex = ref(0)
let subtitleInterval: number | null = null

onMounted(() => {
  // 动态切换副标题文字
  subtitleInterval = window.setInterval(() => {
    currentSubtitleIndex.value = (currentSubtitleIndex.value + 1) % dynamicSubtitles.length
  }, 3000)
})

onUnmounted(() => {
  if (subtitleInterval) {
    clearInterval(subtitleInterval)
  }
})

const animatedSubtitle = computed(() => {
  if (props.subtitle !== '请稍候，系统正在为您分析...') {
    return props.subtitle
  }
  return dynamicSubtitles[currentSubtitleIndex.value]
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 230, 211, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.loading-overlay.full-screen {
  position: fixed;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid rgba(139, 69, 19, 0.1);
  max-width: 400px;
  text-align: center;
  animation: scaleIn 0.5s ease-out;
}

/* 加载动画 */
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: var(--tcm-primary);
  animation-duration: 1.5s;
}

.spinner-ring:nth-child(2) {
  border-right-color: var(--tcm-secondary);
  animation-duration: 2s;
  animation-delay: 0.2s;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: var(--tcm-accent);
  animation-duration: 2.5s;
  animation-delay: 0.4s;
}

.spinner-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  box-shadow: var(--shadow-light);
  animation: pulse 2s ease-in-out infinite;
}

/* 文字样式 */
.loading-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 8px 0;
  animation: fadeInUp 0.8s ease-out;
}

.loading-subtitle {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
  margin: 0 0 16px 0;
  min-height: 20px;
  transition: all 0.3s ease;
  animation: fadeInUp 1s ease-out;
}

/* 加载点动画 */
.loading-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--tcm-primary);
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite;
}

/* 进度条 */
.loading-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 200px;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--tcm-secondary);
  font-weight: 500;
  min-width: 30px;
}

/* 操作按钮 */
.loading-actions {
  margin-top: 8px;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes dotPulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .loading-content {
    padding: 32px 24px;
    margin: 16px;
    max-width: none;
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
  }
  
  .spinner-center {
    width: 36px;
    height: 36px;
  }
  
  .loading-title {
    font-size: 1.1rem;
  }
  
  .loading-subtitle {
    font-size: 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  .loading-content {
    padding: 24px 16px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
  }
  
  .spinner-center {
    width: 30px;
    height: 30px;
  }
}
</style>