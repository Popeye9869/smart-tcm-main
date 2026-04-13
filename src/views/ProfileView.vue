<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>{{ $t('profile.title') }}</h1>
      <p>{{ $t('profile.subtitle') }}</p>
    </div>

    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 个人信息卡片 -->
        <el-col :xs="24" :sm="8" :md="6">
          <div class="profile-card">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userInfo.avatar" class="user-avatar">
                <el-icon size="40"><User /></el-icon>
              </el-avatar>
              <h3>{{ userInfo.name }}</h3>
              <p class="user-role">{{ userInfo.role }}</p>
            </div>
            
            <div class="info-section">
              <div class="info-item">
                <el-icon><Message /></el-icon>
                <span>{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <el-icon><Phone /></el-icon>
                <span>{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ $t('profile.joinDate') }}: {{ formatDate(userInfo.joinDate) }}</span>
              </div>
            </div>

            <div class="action-section">
              <el-button type="primary" @click="showEditDialog = true" class="edit-btn">
                <el-icon><Edit /></el-icon>
                {{ $t('profile.editProfile') }}
              </el-button>
            </div>
          </div>
        </el-col>

        <!-- 主要内容区域 -->
        <el-col :xs="24" :sm="16" :md="18">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <!-- 诊断记录 -->
            <el-tab-pane :label="$t('profile.diagnosisRecords')" name="records">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>{{ $t('profile.recentDiagnosis') }}</h3>
                  <el-button type="primary" link @click="$router.push('/records')">
                    {{ $t('profile.viewAll') }}
                  </el-button>
                </div>
                
                <div class="records-list">
                  <div v-if="recentRecords.length === 0" class="empty-state">
                    <el-icon size="48"><Document /></el-icon>
                    <p>{{ $t('profile.noRecords') }}</p>
                    <el-button type="primary" @click="$router.push('/diagnosis')">
                      {{ $t('profile.startDiagnosis') }}
                    </el-button>
                  </div>
                  
                  <div v-else class="record-cards">
                    <div v-for="record in recentRecords" :key="record.id" class="record-card">
                      <div class="record-header">
                        <span class="record-date">{{ formatDate(record.createdAt) }}</span>
                        <el-tag :type="getStatusType(record.status)" size="small">
                          {{ $t(`diagnosis.status.${record.status}`) }}
                        </el-tag>
                      </div>
                      <div class="record-body">
                        <h4>{{ record.symptoms }}</h4>
                        <p>{{ record.diagnosis }}</p>
                      </div>
                      <div class="record-footer">
                        <el-button type="primary" link @click="viewRecordDetail(record)">
                          {{ $t('common.viewDetail') }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 收藏知识 -->
            <el-tab-pane :label="$t('profile.favoriteKnowledge')" name="favorites">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>{{ $t('profile.myFavorites') }}</h3>
                  <el-button type="primary" link @click="$router.push('/knowledge')">
                    {{ $t('profile.browseMore') }}
                  </el-button>
                </div>
                
                <div class="knowledge-list">
                  <div v-if="favoriteKnowledge.length === 0" class="empty-state">
                    <el-icon size="48"><Star /></el-icon>
                    <p>{{ $t('profile.noFavorites') }}</p>
                    <el-button type="primary" @click="$router.push('/knowledge')">
                      {{ $t('profile.exploreKnowledge') }}
                    </el-button>
                  </div>
                  
                  <div v-else class="knowledge-cards">
                    <div v-for="item in favoriteKnowledge" :key="item.id" class="knowledge-card">
                      <div class="knowledge-header">
                        <el-tag :type="getKnowledgeType(item.category)" size="small">
                          {{ $t(`knowledge.${item.category}`) }}
                        </el-tag>
                        <el-button type="warning" :icon="Star" circle size="small" 
                                  @click="toggleFavorite(item)" />
                      </div>
                      <div class="knowledge-body">
                        <h4>{{ item.title }}</h4>
                        <p>{{ item.summary }}</p>
                      </div>
                      <div class="knowledge-footer">
                        <el-button type="primary" link @click="viewKnowledgeDetail(item)">
                          {{ $t('common.readMore') }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 设置 -->
            <el-tab-pane :label="$t('profile.settings')" name="settings">
              <div class="tab-content">
                <div class="settings-section">
                  <h3>{{ $t('profile.preferences') }}</h3>
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>{{ $t('profile.language') }}</h4>
                      <p>{{ $t('profile.languageDesc') }}</p>
                    </div>
                    <el-select v-model="userSettings.language" @change="updateLanguage">
                      <el-option label="简体中文" value="zh-CN" />
                      <el-option label="English" value="en" />
                    </el-select>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>{{ $t('profile.theme') }}</h4>
                      <p>{{ $t('profile.themeDesc') }}</p>
                    </div>
                    <el-switch
                      v-model="userSettings.darkMode"
                      active-text="深色"
                      inactive-text="浅色"
                      @change="updateTheme"
                    />
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>{{ $t('profile.notifications') }}</h4>
                      <p>{{ $t('profile.notificationsDesc') }}</p>
                    </div>
                    <el-switch
                      v-model="userSettings.notifications"
                      @change="updateNotifications"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="$t('profile.editProfile')"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item :label="$t('profile.name')">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item :label="$t('profile.email')">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item :label="$t('profile.phone')">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveProfile">{{ $t('common.save') }}</el-button>
      <script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Message, 
  Phone, 
  Calendar, 
  Edit, 
  Document, 
  Star
} from '@element-plus/icons-vue'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const { t } = useI18n()
const diagnosisStore = useDiagnosisStore()
const knowledgeStore = useKnowledgeStore()
const appStore = useAppStore()

// 用户信息
const userInfo = reactive({
  name: '张医生',
  email: 'doctor.zhang@example.com',
  phone: '138****8888',
  role: '中医师',
  avatar: '',
  joinDate: new Date('2023-01-15')
})

// 标签页状态
const activeTab = ref('records')
const showEditDialog = ref(false)

// 编辑表单
const editForm = reactive({
  name: userInfo.name,
  email: userInfo.email,
  phone: userInfo.phone
})

// 用户设置
const userSettings = reactive({
  language: 'zh-CN',
  darkMode: false,
  notifications: true
})

// 计算属性
const recentRecords = computed(() => {
  return diagnosisStore.medicalRecords.slice(0, 3)
})

const favoriteKnowledge = computed(() => {
  return knowledgeStore.knowledgeItems.filter(item => item.isFavorited)
})

// 方法
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

const getKnowledgeType = (category: string) => {
  const typeMap: Record<string, string> = {
    'herbs': 'success',
    'acupuncture': 'primary',
    'diagnosis': 'warning',
    'theory': 'info'
  }
  return typeMap[category] || 'info'
}

const viewRecordDetail = (record: any) => {
  router.push(`/records/${record.id}`)
}

const viewKnowledgeDetail = (item: any) => {
  knowledgeStore.selectKnowledge(item)
}

const toggleFavorite = (item: any) => {
  knowledgeStore.toggleFavorite(item.id)
  ElMessage.success(t(item.isFavorited ? 'profile.removedFromFavorites' : 'profile.addedToFavorites'))
}

const saveProfile = () => {
  userInfo.name = editForm.name
  userInfo.email = editForm.email
  userInfo.phone = editForm.phone
  showEditDialog.value = false
  ElMessage.success(t('profile.profileUpdated'))
}

const updateLanguage = (value: string) => {
  appStore.setLanguage(value)
  ElMessage.success(t('profile.languageUpdated'))
}

const updateTheme = (value: boolean) => {
  appStore.setDarkMode(value)
  ElMessage.success(t('profile.themeUpdated'))
}

const updateNotifications = (value: boolean) => {
  userSettings.notifications = value
  localStorage.setItem('userSettings', JSON.stringify(userSettings))
  ElMessage.success(t('profile.notificationsUpdated'))
}

// 初始化
onMounted(async () => {
  // 获取用户设置
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    Object.assign(userSettings, JSON.parse(savedSettings))
  }
  
  // 获取数据
  await diagnosisStore.getMedicalRecords()
  await knowledgeStore.getKnowledgeItems()
})
</script>
    </el-dialog>
  </div>
<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.profile-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
}

.avatar-section {
  margin-bottom: 30px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 15px;
}

.avatar-section h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 10px 0 5px;
}

.user-role {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.info-section {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: #5a6c7d;
}

.info-item .el-icon {
  margin-right: 10px;
  color: #667eea;
}

.edit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.profile-tabs {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 20px 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tab-header h3 {
  color: #2c3e50;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state .el-icon {
  color: #bdc3c7;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.record-cards,
.knowledge-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.record-card,
.knowledge-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.record-card:hover,
.knowledge-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.record-header,
.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.record-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.record-body h4,
.knowledge-body h4 {
  color: #2c3e50;
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.record-body p,
.knowledge-body p {
  color: #5a6c7d;
  margin: 0;
  line-height: 1.5;
}

.record-footer,
.knowledge-footer {
  margin-top: 15px;
  text-align: right;
}

.settings-section h3 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  color: #2c3e50;
  margin: 0 0 5px;
}

.setting-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-container {
    padding: 15px;
  }
  
  .profile-header h1 {
    font-size: 2rem;
  }
  
  .record-cards,
  .knowledge-cards {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-header h1 {
    font-size: 1.8rem;
  }
  
  .profile-card {
    margin-bottom: 20px;
  }
  
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .record-cards,
  .knowledge-cards {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-card {
    padding: 20px;
  }
  
  .profile-tabs {
    padding: 20px;
  }
  
  .profile-header h1 {
    font-size: 1.5rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .profile-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .profile-header h1 {
    color: #ffffff;
  }
  
  .profile-header p {
    color: #a0a0a0;
  }
  
  .profile-card,
  .profile-tabs {
    background: #2d2d2d;
    color: #ffffff;
  }
  
  .avatar-section h3,
  .tab-header h3,
  .settings-section h3,
  .setting-info h4,
  .record-body h4,
  .knowledge-body h4 {
    color: #ffffff;
  }
  
  .user-role,
  .info-item,
  .record-date,
  .setting-info p,
  .record-body p,
  .knowledge-body p {
    color: #a0a0a0;
  }
  
  .record-card,
  .knowledge-card {
    background: #3d3d3d;
    border-color: #4d4d4d;
  }
  
  .setting-item {
    border-color: #4d4d4d;
  }
}
</style>