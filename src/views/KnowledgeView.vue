<template>
  <div class="knowledge-view" :class="{ dark: appStore.isDarkMode }">
    <div class="page-header">
      <h1 class="page-title">中医知识库</h1>
      <p class="page-subtitle">探索传统中医药的博大精深</p>
    </div>

    <div class="search-section">
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索中医知识..."
          size="large"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>
        
        <div class="quick-tags">
          <span class="quick-tags-label">热门搜索：</span>
          <el-tag
            v-for="tag in hotTags"
            :key="tag"
            type="info"
            class="quick-tag"
            @click="quickSearch(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="category-sidebar">
        <div class="category-header">
          <h3>知识分类</h3>
        </div>
        <el-menu
          :default-active="activeCategory"
          class="category-menu"
          @select="handleCategorySelect"
        >
          <el-menu-item index="all">
            <el-icon><Document /></el-icon>
            <span>全部知识</span>
          </el-menu-item>
          <el-menu-item index="herbs">
            <el-icon><MagicStick /></el-icon>
            <span>中药材</span>
          </el-menu-item>
          <el-menu-item index="prescriptions">
            <el-icon><Notebook /></el-icon>
            <span>经典方剂</span>
          </el-menu-item>
          <el-menu-item index="acupuncture">
            <el-icon><Location /></el-icon>
            <span>针灸推拿</span>
          </el-menu-item>
          <el-menu-item index="diagnosis">
            <el-icon><View /></el-icon>
            <span>诊断方法</span>
          </el-menu-item>
          <el-menu-item index="theory">
            <el-icon><Reading /></el-icon>
            <span>中医理论</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="knowledge-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="knowledgeItems.length === 0" class="empty-container">
          <el-empty description="暂无相关知识" />
        </div>
        
        <div v-else class="knowledge-grid">
          <div
            v-for="item in knowledgeItems"
            :key="item.id"
            class="knowledge-card"
            @click="showKnowledgeDetail(item)"
          >
            <div class="card-header">
              <el-icon class="card-icon">
                <component :is="getCategoryIcon(item.category)" />
              </el-icon>
              <div class="card-title">
                <h4>{{ item.title }}</h4>
                <span class="card-category">{{ getCategoryName(item.category) }}</span>
              </div>
            </div>
            <div class="card-content">
              <p class="card-description">{{ item.description }}</p>
              <div class="card-tags">
                <el-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  class="card-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="card-footer">
              <span class="card-date">{{ formatDate(item.createdAt) }}</span>
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ item.views }}
                </span>
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ item.likes }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalItems"
            :page-sizes="[12, 24, 36]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 知识详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentKnowledge?.title"
      width="80%"
      top="5vh"
      class="knowledge-detail-dialog"
    >
      <div v-if="currentKnowledge" class="knowledge-detail">
        <div class="detail-header">
          <div class="detail-category">
            <el-tag type="primary">{{ getCategoryName(currentKnowledge.category) }}</el-tag>
            <div class="detail-tags">
              <el-tag
                v-for="tag in currentKnowledge.tags"
                :key="tag"
                type="info"
                size="small"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="detail-stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ currentKnowledge.views }}
            </span>
            <span class="stat-item">
              <el-icon><Star /></el-icon>
              {{ currentKnowledge.likes }}
            </span>
            <span class="stat-item">
              <el-icon><Clock /></el-icon>
              {{ formatDate(currentKnowledge.createdAt) }}
            </span>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="content-section" v-if="currentKnowledge.content">
            <div v-html="currentKnowledge.content" class="content-html"></div>
          </div>
          
          <div class="content-section" v-if="currentKnowledge.relatedItems?.length">
            <h4>相关内容</h4>
            <div class="related-items">
              <div
                v-for="related in currentKnowledge.relatedItems"
                :key="related.id"
                class="related-item"
                @click="showRelatedKnowledge(related)"
              >
                <el-icon><ArrowRight /></el-icon>
                <span>{{ related.title }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <el-button type="primary" @click="likeKnowledge">
            <el-icon><Star /></el-icon>
            收藏
          </el-button>
          <el-button @click="shareKnowledge">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
          <el-button @click="printKnowledge">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useAppStore } from '@/stores/app'
import type { KnowledgeItem, KnowledgeCategory } from '@/types/tcm'

const knowledgeStore = useKnowledgeStore()
const appStore = useAppStore()

// 搜索相关
const searchQuery = ref('')
const hotTags = ref(['人参', '黄芪', '当归', '四物汤', '针灸', '脉诊', '阴阳', '五行'])

// 分类相关
const activeCategory = ref('all')
const categories = reactive({
  all: '全部知识',
  herbs: '中药材',
  prescriptions: '经典方剂',
  acupuncture: '针灸推拿',
  diagnosis: '诊断方法',
  theory: '中医理论'
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)

// 数据相关
const loading = ref(false)
const knowledgeItems = ref<KnowledgeItem[]>([])

// 详情相关
const detailDialogVisible = ref(false)
const currentKnowledge = ref<KnowledgeItem | null>(null)

// 获取分类图标
const getCategoryIcon = (category: KnowledgeCategory) => {
  const iconMap = {
    herbs: 'MagicStick',
    prescriptions: 'Notebook',
    acupuncture: 'Location',
    diagnosis: 'View',
    theory: 'Reading'
  }
  return iconMap[category] || 'Document'
}

// 获取分类名称
const getCategoryName = (category: KnowledgeCategory) => {
  return categories[category] || '未知分类'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 搜索处理
const handleSearch = async () => {
  loading.value = true
  try {
    await knowledgeStore.searchKnowledge(searchQuery.value, activeCategory.value)
    knowledgeItems.value = knowledgeStore.knowledgeItems
    totalItems.value = knowledgeStore.totalItems
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 快速搜索
const quickSearch = (tag: string) => {
  searchQuery.value = tag
  handleSearch()
}

// 分类选择
const handleCategorySelect = (category: string) => {
  activeCategory.value = category
  currentPage.value = 1
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  handleSearch()
}

// 显示知识详情
const showKnowledgeDetail = async (item: KnowledgeItem) => {
  loading.value = true
  try {
    const detail = await knowledgeStore.getKnowledgeDetail(item.id)
    currentKnowledge.value = detail
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 显示相关知识
const showRelatedKnowledge = (related: KnowledgeItem) => {
  detailDialogVisible.value = false
  showKnowledgeDetail(related)
}

// 收藏知识
const likeKnowledge = async () => {
  if (!currentKnowledge.value) return
  
  try {
    await knowledgeStore.likeKnowledge(currentKnowledge.value.id)
    ElMessage.success('收藏成功')
    if (currentKnowledge.value) {
      currentKnowledge.value.likes++
    }
  } catch (error) {
    ElMessage.error('收藏失败，请稍后重试')
  }
}

// 分享知识
const shareKnowledge = () => {
  if (!currentKnowledge.value) return
  
  const shareText = `中医知识：${currentKnowledge.value.title}`
  if (navigator.share) {
    navigator.share({
      title: shareText,
      text: currentKnowledge.value.description,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(`${shareText} - ${window.location.href}`)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 打印知识
const printKnowledge = () => {
  window.print()
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.knowledge-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 100%);
  padding: 40px 24px;
}

.knowledge-view.dark {
  background: linear-gradient(135deg, #2f2f2f 0%, #3a3a3a 100%);
  color: #f5f5f5;
  transition: background 0.3s ease, color 0.3s ease;
}

.knowledge-view.dark .page-title {
  color: #f8e3c2;
}

.knowledge-view.dark .page-subtitle,
.knowledge-view.dark .quick-tags-label,
.knowledge-view.dark .card-category,
.knowledge-view.dark .card-description,
.knowledge-view.dark .card-date,
.knowledge-view.dark .stat-item,
.knowledge-view.dark .related-item span,
.knowledge-view.dark .content-html,
.knowledge-view.dark .detail-stats .stat-item,
.knowledge-view.dark .pagination-container :deep(.el-pagination__total),
.knowledge-view.dark .pagination-container :deep(.el-pagination__sizes),
.knowledge-view.dark .pagination-container :deep(.el-pagination__jump) {
  color: #e0d8cf;
}

.knowledge-view.dark .search-container,
.knowledge-view.dark .category-sidebar,
.knowledge-view.dark .knowledge-content {
  background: rgba(34, 34, 34, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
}

.knowledge-view.dark .search-input :deep(.el-input__wrapper) {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: none;
  background: rgba(255, 255, 255, 0.08);
  color: #f5f5f5;
}

.knowledge-view.dark .search-input :deep(.el-input__inner),
.knowledge-view.dark .search-input :deep(.el-input__prefix),
.knowledge-view.dark .search-input :deep(.el-input__suffix) {
  color: #f5f5f5;
}

.knowledge-view.dark .search-input :deep(.el-input-group__append) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
  color: #2f2f2f;
}

.knowledge-view.dark .quick-tag {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f5f5f5;
}

.knowledge-view.dark .category-header h3,
.knowledge-view.dark .card-title h4,
.knowledge-view.dark .content-section h4 {
  color: #f8e3c2;
}

.knowledge-view.dark .category-menu :deep(.el-menu-item) {
  color: #e0d8cf;
}

.knowledge-view.dark .category-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
}

.knowledge-view.dark .category-menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.9);
  color: #2f2f2f;
}

.knowledge-view.dark .knowledge-card {
  background: rgba(34, 34, 34, 0.92);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.35);
}

.knowledge-view.dark .knowledge-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 32px rgba(0, 0, 0, 0.45);
}

.knowledge-view.dark .card-icon {
  color: #f8e3c2;
}

.knowledge-view.dark .card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.knowledge-view.dark :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f5f5f5;
}

.knowledge-view.dark .related-item {
  background: rgba(255, 255, 255, 0.06);
}

.knowledge-view.dark .related-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.knowledge-view.dark .detail-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.knowledge-view.dark .detail-actions .el-button {
  box-shadow: none;
}

.knowledge-view.dark .knowledge-detail-dialog :deep(.el-dialog) {
  background: rgba(34, 34, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.knowledge-view.dark .knowledge-detail-dialog :deep(.el-dialog__header) {
  background: rgba(60, 60, 60, 0.95);
  color: #f5f5f5;
  border-radius: 20px 20px 0 0;
}

.knowledge-view.dark .knowledge-detail-dialog :deep(.el-dialog__title),
.knowledge-view.dark .knowledge-detail-dialog :deep(.el-dialog__close) {
  color: #f5f5f5;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--tcm-secondary);
  margin: 0;
}

/* 搜索区域 */
.search-section {
  max-width: 1200px;
  margin: 0 auto 48px auto;
}

.search-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.search-input {
  margin-bottom: 24px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid var(--tcm-primary);
  box-shadow: 0 0 0 1px var(--tcm-primary);
}

.search-input :deep(.el-input-group__append) {
  background: var(--tcm-primary);
  border: 1px solid var(--tcm-primary);
  border-radius: 0 12px 12px 0;
  color: white;
}

.quick-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-tags-label {
  font-weight: 600;
  color: var(--tcm-secondary);
}

.quick-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* 分类侧边栏 */
.category-sidebar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.category-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.category-menu {
  border: none;
  background: transparent;
}

.category-menu :deep(.el-menu-item) {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.category-menu :deep(.el-menu-item:hover) {
  background: rgba(139, 69, 19, 0.1);
}

.category-menu :deep(.el-menu-item.is-active) {
  background: var(--tcm-primary);
  color: white;
}

/* 知识内容 */
.knowledge-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.loading-container {
  padding: 80px 0;
}

.empty-container {
  padding: 80px 0;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.knowledge-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(139, 69, 19, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: var(--tcm-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 2rem;
  color: var(--tcm-primary);
}

.card-title h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 4px 0;
}

.card-category {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
}

.card-content {
  margin-bottom: 20px;
}

.card-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--tcm-secondary);
  margin: 0 0 16px 0;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-tag {
  font-size: 0.8rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.card-date {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
}

.card-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--tcm-secondary);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.pagination-container :deep(.el-pagination) {
  justify-content: center;
}

/* 详情对话框 */
.knowledge-detail-dialog :deep(.el-dialog) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.knowledge-detail {
  padding: 24px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.detail-category {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-stats {
  display: flex;
  gap: 16px;
}

.detail-content {
  margin-bottom: 32px;
}

.content-section {
  margin-bottom: 32px;
}

.content-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.content-html {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--tcm-secondary);
}

.related-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  background: rgba(139, 69, 19, 0.1);
  transform: translateX(4px);
}

.related-item span {
  font-size: 1rem;
  color: var(--tcm-primary);
}

.detail-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.detail-actions .el-button {
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .content-section {
    grid-template-columns: 240px 1fr;
    gap: 24px;
  }
  
  .knowledge-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media screen and (max-width: 768px) {
  .knowledge-view {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .content-section {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .category-sidebar {
    position: static;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
  
  .knowledge-card {
    padding: 20px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-stats {
    justify-content: flex-start;
  }
  
  .detail-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .detail-actions .el-button {
    width: 200px;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .search-container,
  .knowledge-content {
    padding: 20px;
  }
  
  .quick-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .knowledge-detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
}
</style>