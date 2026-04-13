<template>
  <div class="home-view" :class="{ dark: appStore.isDarkMode }">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text" v-motion-slide-left>
          <h1 class="hero-title">
            智能中医诊疗系统
            <span class="title-highlight">AI-powered</span>
          </h1>
          <p class="hero-subtitle">
            传承千年中医智慧，融合现代科技力量
            <br />
            基于大模型的智能诊断，为您提供专业、准确的中医诊疗服务
          </p>
          <div class="hero-actions">
            <el-button 
              type="primary" 
              size="large" 
              class="cta-button"
              @click="startDiagnosis"
              v-motion-pop
            >
              <el-icon size="16">
                <MostlyCloudy />
              </el-icon>
              开始智能诊断
            </el-button>
            <el-button 
              size="large" 
              class="secondary-button"
              @click="learnMore"
              v-motion-pop
              :delay="100"
            >
              <el-icon size="16">
                <InfoFilled />
              </el-icon>
              了解更多
            </el-button>
          </div>
        </div>
        
        <div class="hero-visual" v-motion-slide-right>
          <div class="floating-cards">
            <div class="card card-1" v-motion-float>
              <el-icon size="32" color="var(--tcm-primary)">
                <MostlyCloudy />
              </el-icon>
              <span>智能诊断</span>
            </div>
            <div class="card card-2" v-motion-float :delay="200">
              <el-icon size="32" color="var(--tcm-secondary)">
                <DocumentCopy />
              </el-icon>
              <span>个性化处方</span>
            </div>
            <div class="card card-3" v-motion-float :delay="400">
              <el-icon size="32" color="var(--tcm-accent)">
                <TrendCharts />
              </el-icon>
              <span>健康管理</span>
            </div>
          </div>
          
          <div class="pulse-ring"></div>
          <div class="pulse-ring pulse-ring-2"></div>
          <div class="pulse-ring pulse-ring-3"></div>
        </div>
      </div>
      
      <!-- 滚动指示器 -->
      <div class="scroll-indicator" @click="scrollToFeatures">
        <div class="scroll-text"></div>
        <div class="scroll-arrow"></div>
      </div>
    </section>
    
    <!-- 特性展示 -->
    <section class="features-section" ref="featuresSection">
      <div class="section-header" v-motion-fade-visible>
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle">融合传统中医理论与现代AI技术</p>
      </div>
      
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.key"
          class="feature-card"
          v-motion-slide-visible-up
          :delay="index * 100"
        >
          <div class="feature-icon">
            <el-icon size="48" :color="feature.color">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-tags">
            <el-tag 
              v-for="tag in feature.tags" 
              :key="tag"
              size="small"
              :type="feature.tagType"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 诊断流程 -->
    <section class="process-section">
      <div class="section-header" v-motion-fade-visible>
        <h2 class="section-title">诊断流程</h2>
        <p class="section-subtitle">简单四步，获得专业中医诊断</p>
      </div>
      
      <div class="process-timeline">
        <div 
          v-for="(step, index) in processSteps" 
          :key="step.key"
          class="process-step"
          v-motion-slide-visible-right
          :delay="index * 200"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
          <div class="step-icon">
            <el-icon size="32" :color="step.color">
              <component :is="step.icon" />
            </el-icon>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div 
          v-for="(stat, index) in stats" 
          :key="stat.key"
          class="stat-card"
          v-motion-slide-visible-up
          :delay="index * 100"
        >
          <div class="stat-icon">
            <el-icon size="32" :color="stat.color">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-content" v-motion-fade-visible>
        <h2 class="cta-title">开始您的中医智能诊疗之旅</h2>
        <p class="cta-subtitle">体验传统中医与现代AI技术的完美结合</p>
        <div class="cta-actions">
          <el-button 
            type="primary" 
            size="large"
            class="cta-button"
            @click="startDiagnosis"
          >
            立即体验
          </el-button>
          <el-button 
            size="large"
            class="secondary-button"
            @click="viewDemo"
          >
            查看演示
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MostlyCloudy,
  InfoFilled,
  DocumentCopy,
  TrendCharts,
  User,
  Edit,
  Search,
  MagicStick,
  CircleCheck,
  Collection,
  DataAnalysis,
  Star
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const featuresSection = ref<HTMLElement>()
const appStore = useAppStore()

const features = [
  {
    key: 'diagnosis',
    title: '智能诊断',
    description: '基于大模型的智能分析，结合症状、脉象、舌象等多维度信息，提供准确的中医诊断结果。',
    icon: 'MostlyCloudy',
    color: 'var(--tcm-primary)',
    tags: ['AI诊断', '多维度分析', '准确率高'],
    tagType: 'primary'
  },
  {
    key: 'prescription',
    title: '个性化处方',
    description: '根据诊断结果和个人体质，智能推荐最适合的中药方剂，包含详细的用药指导。',
    icon: 'DocumentCopy',
    color: 'var(--tcm-secondary)',
    tags: ['个性化', '方剂推荐', '用药指导'],
    tagType: 'success'
  },
  {
    key: 'knowledge',
    title: '中医知识库',
    description: '丰富的中医理论知识库，涵盖基础理论、诊断方法、治疗原则等各个方面。',
    icon: 'Collection',
    color: 'var(--tcm-accent)',
    tags: ['知识丰富', '理论全面', '易于查询'],
    tagType: 'info'
  },
  {
    key: 'health',
    title: '健康管理',
    description: '记录和分析您的健康数据，提供个性化的养生建议和健康监测。',
    icon: 'TrendCharts',
    color: 'var(--tcm-success)',
    tags: ['数据记录', '健康监测', '养生建议'],
    tagType: 'warning'
  }
]

const processSteps = [
  {
    key: 'symptoms',
    title: '描述症状',
    description: '详细描述您的症状、不适感受，包括发病时间、严重程度等信息。',
    icon: 'Edit',
    color: 'var(--tcm-primary)'
  },
  {
    key: 'analysis',
    title: '智能分析',
    description: 'AI系统根据中医理论，结合您的症状信息进行深度分析和诊断。',
    icon: 'Search',
    color: 'var(--tcm-secondary)'
  },
  {
    key: 'diagnosis',
    title: '获得诊断',
    description: '获得详细的中医诊断结果，包括证型分析、病因病机等专业解读。',
    icon: 'MostlyCloudy',
    color: 'var(--tcm-accent)'
  },
  {
    key: 'treatment',
    title: '治疗建议',
    description: '获取个性化的治疗方案，包括中药方剂、生活调护等全面建议。',
    icon: 'MagicStick',
    color: 'var(--tcm-success)'
  }
]

const stats = [
  {
    key: 'users',
    number: '10,000+',
    label: '服务用户',
    icon: 'User',
    color: 'var(--tcm-primary)'
  },
  {
    key: 'diagnosis',
    number: '50,000+',
    label: '诊断次数',
    icon: 'MostlyCloudy',
    color: 'var(--tcm-secondary)'
  },
  {
    key: 'accuracy',
    number: '95%',
    label: '诊断准确率',
    icon: 'CircleCheck',
    color: 'var(--tcm-success)'
  },
  {
    key: 'knowledge',
    number: '1,000+',
    label: '知识条目',
    icon: 'Collection',
    color: 'var(--tcm-accent)'
  }
]

const startDiagnosis = () => {
  router.push('/diagnosis')
}

const learnMore = () => {
  router.push('/about')
}

const viewDemo = () => {
  router.push('/demo')
}

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 100%);
}

.home-view.dark {
  background: linear-gradient(135deg, #2f2f2f 0%, #3a3a3a 100%);
  color: #f5f5f5;
  transition: background 0.3s ease, color 0.3s ease;
}

.home-view.dark .hero-section {
  background: linear-gradient(135deg, rgba(40, 40, 40, 0.9) 0%, rgba(60, 60, 60, 0.9) 100%);
}

.home-view.dark .hero-title,
.home-view.dark .section-title,
.home-view.dark .cta-title,
.home-view.dark .stat-number,
.home-view.dark .step-number,
.home-view.dark .feature-title,
.home-view.dark .step-title {
  color: #f8e3c2;
}

.home-view.dark .hero-subtitle,
.home-view.dark .section-subtitle,
.home-view.dark .feature-description,
.home-view.dark .step-description,
.home-view.dark .stat-label,
.home-view.dark .cta-subtitle,
.home-view.dark .scroll-text {
  color: #e0d8cf;
}

.home-view.dark .secondary-button {
  background: rgba(255, 255, 255, 0.08);
  color: #f8e3c2;
  border-color: rgba(255, 255, 255, 0.2);
}

.home-view.dark .secondary-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #2f2f2f;
}

.home-view.dark .scroll-arrow {
  border-color: rgba(255, 255, 255, 0.6);
}

.home-view.dark .card,
.home-view.dark .feature-card,
.home-view.dark .stat-card {
  background: rgba(34, 34, 34, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

.home-view.dark .card span,
.home-view.dark .feature-card,
.home-view.dark .stat-card {
  color: #e0d8cf;
}

.home-view.dark .process-section {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%);
}

.home-view.dark .process-step {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.08);
}

.home-view.dark .step-number {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.45);
}

.home-view.dark .stats-section,
.home-view.dark .features-section {
  background: transparent;
}

.home-view.dark .cta-section {
  background: linear-gradient(135deg, #3f3f3f 0%, #2a2a2a 100%);
}

.home-view.dark .cta-section .cta-button {
  background: rgba(255, 255, 255, 0.9);
  color: #2f2f2f;
}

.home-view.dark .cta-section .secondary-button {
  border-color: rgba(255, 255, 255, 0.8);
}

.home-view.dark :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f5f5f5;
}

/* 英雄区域 */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(210, 105, 30, 0.1) 100%);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0 0 24px 0;
  line-height: 1.2;
}

.title-highlight {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--tcm-secondary);
  margin: 0 0 48px 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.cta-button {
  background: var(--gradient-primary);
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-heavy);
}

.secondary-button {
  background: rgba(139, 69, 19, 0.1);
  color: var(--tcm-primary);
  border: 2px solid var(--tcm-primary);
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: var(--tcm-primary);
  color: white;
  transform: translateY(-2px);
}

/* 视觉元素 */
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.floating-cards {
  position: relative;
  z-index: 2;
}

.card {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
  min-width: 120px;
  animation: float 3s ease-in-out infinite;
}

.card-1 {
  top: -60px;
  left: -40px;
  animation-delay: 0s;
}

.card-2 {
  top: 20px;
  right: -60px;
  animation-delay: 1s;
}

.card-3 {
  bottom: -40px;
  left: 20px;
  animation-delay: 2s;
}

.card span {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--tcm-dark);
  text-align: center;
}

/* 脉冲环 */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid var(--tcm-primary);
  border-radius: 50%;
  opacity: 0;
  animation: pulseRing 3s ease-out infinite;
}

.pulse-ring-2 {
  animation-delay: 1s;
}

.pulse-ring-3 {
  animation-delay: 2s;
}

/* 滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  animation: bounce 2s infinite;
}

.scroll-text {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
  font-weight: 500;
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  border-right: 2px solid var(--tcm-secondary);
  border-bottom: 2px solid var(--tcm-secondary);
  transform: rotate(45deg);
  animation: arrowBounce 2s infinite;
}

/* 特性区域 */
.features-section {
  padding: 120px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.section-subtitle {
  font-size: 1.2rem;
  color: var(--tcm-secondary);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-heavy);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.feature-description {
  font-size: 1rem;
  color: var(--tcm-secondary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

/* 流程区域 */
.process-section {
  padding: 120px 24px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(210, 105, 30, 0.05) 100%);
}

.process-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: var(--shadow-medium);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 12px 0;
}

.step-description {
  font-size: 1rem;
  color: var(--tcm-secondary);
  margin: 0;
  line-height: 1.6;
}

.step-icon {
  margin-top: 16px;
}

/* 统计区域 */
.stats-section {
  padding: 120px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.stat-icon {
  margin-bottom: 16px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0 0 8px 0;
}

.stat-label {
  font-size: 1rem;
  color: var(--tcm-secondary);
  margin: 0;
}

/* CTA 区域 */
.cta-section {
  padding: 120px 24px;
  background: linear-gradient(135deg, var(--tcm-primary) 0%, var(--tcm-secondary) 100%);
  text-align: center;
  color: white;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.cta-subtitle {
  font-size: 1.2rem;
  margin: 0 0 48px 0;
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cta-section .cta-button {
  background: white;
  color: var(--tcm-primary);
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cta-section .cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-heavy);
}

.cta-section .secondary-button {
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cta-section .secondary-button:hover {
  background: white;
  color: var(--tcm-primary);
  transform: translateY(-2px);
}

/* 动画定义 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulseRing {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes arrowBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) rotate(45deg) translateY(0);
  }
  40% {
    transform: translateX(-50%) rotate(45deg) translateY(-5px);
  }
  60% {
    transform: translateX(-50%) rotate(45deg) translateY(-2px);
  }
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .process-timeline {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .hero-section {
    min-height: 80vh;
    padding: 40px 16px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button,
  .secondary-button {
    width: 200px;
  }
  
  .features-section,
  .process-section,
  .stats-section {
    padding: 80px 16px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .feature-card {
    padding: 32px 24px;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media screen and (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-visual {
    height: 300px;
  }
  
  .card {
    min-width: 100px;
    padding: 16px;
  }
  
  .card-1 {
    top: -40px;
    left: -20px;
  }
  
  .card-2 {
    top: 10px;
    right: -40px;
  }
  
  .card-3 {
    bottom: -20px;
    left: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
