import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TCMService } from '@/services/aiService'
import type { KnowledgeItem, KnowledgeCategory } from '@/types/tcm'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // 状态
  const knowledgeItems = ref<KnowledgeItem[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const loading = ref(false)
  const searchQuery = ref('')
  const activeCategory = ref<KnowledgeCategory | 'all'>('all')
  
  // AI服务
  const tcmService = new TCMService()

  // 计算属性
  const hasMore = computed(() => knowledgeItems.value.length < totalItems.value)
  const isLoading = computed(() => loading.value)

  // 搜索知识
  const searchKnowledge = async (query: string, category: KnowledgeCategory | 'all' = 'all', page = 1, size = 12) => {
    loading.value = true
    try {
      searchQuery.value = query
      activeCategory.value = category
      currentPage.value = page
      pageSize.value = size

      // 构建搜索参数
      const searchParams = {
        query,
        category: category === 'all' ? undefined : category,
        page,
        size,
        includeRelated: true
      }

      // 调用AI服务搜索知识
      const result = await tcmService.searchKnowledge(searchParams)
      
      knowledgeItems.value = result.items
      totalItems.value = result.total
      
      return result
    } catch (error) {
      console.error('搜索知识失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取知识详情
  const getKnowledgeDetail = async (id: string) => {
    loading.value = true
    try {
      // 调用AI服务获取知识详情
      const detail = await tcmService.getKnowledgeDetail(id)
      
      // 更新本地数据
      const index = knowledgeItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        knowledgeItems.value[index] = { ...knowledgeItems.value[index], ...detail }
      }
      
      return detail
    } catch (error) {
      console.error('获取知识详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 收藏知识
  const likeKnowledge = async (id: string) => {
    try {
      // 调用AI服务收藏知识
      await tcmService.likeKnowledge(id)
      
      // 更新本地数据
      const item = knowledgeItems.value.find(item => item.id === id)
      if (item) {
        item.likes += 1
        item.isLiked = true
      }
      
      return true
    } catch (error) {
      console.error('收藏知识失败:', error)
      throw error
    }
  }

  // 获取推荐知识
  const getRecommendedKnowledge = async (category?: KnowledgeCategory, limit = 6) => {
    try {
      const result = await tcmService.getRecommendedKnowledge({
        category,
        limit,
        excludeIds: knowledgeItems.value.map(item => item.id)
      })
      
      return result.items
    } catch (error) {
      console.error('获取推荐知识失败:', error)
      throw error
    }
  }

  // 获取热门知识
  const getHotKnowledge = async (category?: KnowledgeCategory, limit = 10) => {
    try {
      const result = await tcmService.getHotKnowledge({
        category,
        limit
      })
      
      return result.items
    } catch (error) {
      console.error('获取热门知识失败:', error)
      throw error
    }
  }

  // 加载更多
  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      const nextPage = currentPage.value + 1
      await searchKnowledge(searchQuery.value, activeCategory.value, nextPage, pageSize.value)
    }
  }

  // 刷新数据
  const refresh = async () => {
    await searchKnowledge(searchQuery.value, activeCategory.value, currentPage.value, pageSize.value)
  }

  // 清除搜索
  const clearSearch = () => {
    searchQuery.value = ''
    activeCategory.value = 'all'
    currentPage.value = 1
    knowledgeItems.value = []
    totalItems.value = 0
  }

  // 设置分类
  const setCategory = async (category: KnowledgeCategory | 'all') => {
    activeCategory.value = category
    currentPage.value = 1
    await searchKnowledge(searchQuery.value, category, currentPage.value, pageSize.value)
  }

  // 设置搜索查询
  const setSearchQuery = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
    await searchKnowledge(query, activeCategory.value, currentPage.value, pageSize.value)
  }

  return {
    // 状态
    knowledgeItems,
    totalItems,
    currentPage,
    pageSize,
    loading: isLoading,
    searchQuery,
    activeCategory,
    hasMore,
    
    // 方法
    searchKnowledge,
    getKnowledgeDetail,
    likeKnowledge,
    getRecommendedKnowledge,
    getHotKnowledge,
    loadMore,
    refresh,
    clearSearch,
    setCategory,
    setSearchQuery
  }
})