<template>
  <div class="records-view" :class="{ dark: appStore.isDarkMode }">
    <div class="page-header">
      <h1 class="page-title">病历管理</h1>
      <p class="page-subtitle">管理和查看您的中医诊疗记录</p>
    </div>

    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input
            v-model="searchForm.patientName"
            placeholder="请输入患者姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="诊断日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="诊断结果">
          <el-select
            v-model="searchForm.diagnosis"
            placeholder="选择诊断结果"
            clearable
          >
            <el-option label="风寒感冒" value="风寒感冒" />
            <el-option label="风热感冒" value="风热感冒" />
            <el-option label="脾胃虚弱" value="脾胃虚弱" />
            <el-option label="肝郁气滞" value="肝郁气滞" />
            <el-option label="肾虚" value="肾虚" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" :icon="Refresh">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="actions-section">
      <div class="left-actions">
        <el-button type="primary" @click="handleNewRecord" :icon="Plus">
          新建病历
        </el-button>
        <el-button @click="handleExport" :icon="Download">
          导出数据
        </el-button>
      </div>
      <div class="right-actions">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="table">
            <el-icon><Grid /></el-icon>
            表格视图
          </el-radio-button>
          <el-radio-button label="card">
            <el-icon><Picture /></el-icon>
            卡片视图
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="records-content">
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <el-table
          :data="records"
          v-loading="loading"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="patientName" label="患者姓名" width="120" />
          <el-table-column prop="patientAge" label="年龄" width="80" />
          <el-table-column prop="patientGender" label="性别" width="80">
            <template #default="{ row }">
              <el-tag :type="row.patientGender === '男' ? 'primary' : 'success'">
                {{ row.patientGender }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="diagnosisDate" label="诊断日期" width="120" />
          <el-table-column prop="mainSymptoms" label="主要症状" min-width="200" show-overflow-tooltip />
          <el-table-column prop="diagnosis" label="诊断结果" min-width="150" />
          <el-table-column prop="prescription" label="处方" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleView(row)" :icon="View">
                查看
              </el-button>
              <el-button type="warning" link @click="handleEdit(row)" :icon="Edit">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)" :icon="Delete">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="record in records" :key="record.id">
            <el-card class="record-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <div class="patient-info">
                    <h4>{{ record.patientName }}</h4>
                    <span class="patient-meta">
                      {{ record.patientAge }}岁 · {{ record.patientGender }}
                    </span>
                  </div>
                  <el-tag :type="getDiagnosisType(record.diagnosis)">
                    {{ record.diagnosis }}
                  </el-tag>
                </div>
              </template>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">诊断日期：</span>
                  <span class="value">{{ record.diagnosisDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">主要症状：</span>
                  <span class="value">{{ record.mainSymptoms }}</span>
                </div>
                <div class="info-item">
                  <span class="label">处方：</span>
                  <span class="value">{{ record.prescription }}</span>
                </div>
              </div>
              <template #footer>
                <div class="card-actions">
                  <el-button type="primary" text @click="handleView(record)" :icon="View">
                    查看
                  </el-button>
                  <el-button type="warning" text @click="handleEdit(record)" :icon="Edit">
                    编辑
                  </el-button>
                  <el-button type="danger" text @click="handleDelete(record)" :icon="Delete">
                    删除
                  </el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalRecords"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 病历详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="病历详情"
      width="80%"
      top="5vh"
      class="record-detail-dialog"
    >
      <div v-if="currentRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="患者姓名">{{ currentRecord.patientName }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentRecord.patientGender }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ currentRecord.patientAge }}岁</el-descriptions-item>
          <el-descriptions-item label="诊断日期">{{ currentRecord.diagnosisDate }}</el-descriptions-item>
          <el-descriptions-item label="联系电话" :span="2">{{ currentRecord.patientPhone }}</el-descriptions-item>
          <el-descriptions-item label="主要症状" :span="2">{{ currentRecord.mainSymptoms }}</el-descriptions-item>
          <el-descriptions-item label="诊断结果" :span="2">
            <el-tag type="primary">{{ currentRecord.diagnosis }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="舌象" :span="2">{{ currentRecord.tongueAppearance }}</el-descriptions-item>
          <el-descriptions-item label="脉象" :span="2">{{ currentRecord.pulseCondition }}</el-descriptions-item>
          <el-descriptions-item label="治疗方案" :span="2">{{ currentRecord.treatmentPlan }}</el-descriptions-item>
          <el-descriptions-item label="处方" :span="2">{{ currentRecord.prescription }}</el-descriptions-item>
          <el-descriptions-item label="生活建议" :span="2">{{ currentRecord.lifestyleAdvice }}</el-descriptions-item>
          <el-descriptions-item label="预后" :span="2">{{ currentRecord.prognosis }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.notes }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useAppStore } from '@/stores/app'
import type { MedicalRecord } from '@/types/tcm'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Grid,
  Picture,
  View,
  Edit,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const diagnosisStore = useDiagnosisStore() as any
const appStore = useAppStore()

// 搜索表单
const searchForm = reactive({
  patientName: '',
  dateRange: [],
  diagnosis: ''
})

// 视图模式
const viewMode = ref<'table' | 'card'>('table')

// 数据相关
const loading = ref(false)
const records = ref<MedicalRecord[]>([])
const selectedRecords = ref<MedicalRecord[]>([])
const currentRecord = ref<MedicalRecord | null>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 对话框
const detailDialogVisible = ref(false)

// 获取诊断类型标签
const getDiagnosisType = (diagnosis: string) => {
  const typeMap: Record<string, string> = {
    '风寒感冒': 'info',
    '风热感冒': 'warning',
    '脾胃虚弱': 'primary',
    '肝郁气滞': 'danger',
    '肾虚': 'success'
  }
  return typeMap[diagnosis] || 'info'
}

// 搜索处理
const handleSearch = async () => {
  loading.value = true
  try {
  const result = await diagnosisStore.getMedicalRecords({
      patientName: searchForm.patientName,
      dateRange: searchForm.dateRange as string[],
      diagnosis: searchForm.diagnosis,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    records.value = result.records
    totalRecords.value = result.total
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.patientName = ''
  searchForm.dateRange = []
  searchForm.diagnosis = ''
  currentPage.value = 1
  handleSearch()
}

// 新建病历
const handleNewRecord = () => {
  router.push('/diagnosis')
}

// 导出数据
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 查看详情
const handleView = (record: MedicalRecord) => {
  currentRecord.value = record
  detailDialogVisible.value = true
}

// 编辑病历
const handleEdit = (record: MedicalRecord) => {
  router.push({
    path: '/diagnosis',
    query: { recordId: record.id }
  })
}

// 删除病历
const handleDelete = async (record: MedicalRecord) => {
  try {
    const patientName = (record as any).patientName
    await ElMessageBox.confirm(
      `确定要删除患者 "${patientName}" 的病历吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await diagnosisStore.deleteMedicalRecord(record.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: MedicalRecord[]) => {
  selectedRecords.value = selection
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

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.records-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 100%);
  padding: 40px 24px;
}

.records-view.dark {
  background: linear-gradient(135deg, #2f2f2f 0%, #3a3a3a 100%);
  color: #f5f5f5;
  transition: background 0.3s ease, color 0.3s ease;
}

.records-view.dark .page-title {
  color: #f8e3c2;
}

.records-view.dark .page-subtitle {
  color: #e0d8cf;
}

.records-view.dark .search-form,
.records-view.dark .records-content {
  background: rgba(34, 34, 34, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
}

.records-view.dark .search-form :deep(.el-form-item__label) {
  color: #f8e3c2;
}

.records-view.dark .search-form :deep(.el-input__wrapper),
.records-view.dark .search-form :deep(.el-select__wrapper),
.records-view.dark .search-form :deep(.el-date-editor) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: none;
  color: #f5f5f5;
}

.records-view.dark .search-form :deep(.el-input__inner),
.records-view.dark .search-form :deep(.el-select__placeholder),
.records-view.dark .search-form :deep(.el-date-editor input) {
  color: #f5f5f5;
}

.records-view.dark .actions-section :deep(.el-button) {
  box-shadow: none;
}

.records-view.dark .actions-section :deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.05);
  color: #f5f5f5;
  border-color: rgba(255, 255, 255, 0.08);
}

.records-view.dark .table-view :deep(.el-table) {
  background: transparent;
}

.records-view.dark .table-view :deep(.el-table__header-wrapper) {
  background: rgba(50, 50, 50, 0.95);
}

.records-view.dark .table-view :deep(.el-table th) {
  background: rgba(50, 50, 50, 0.95);
  color: #f8e3c2;
}

.records-view.dark .table-view :deep(.el-table td) {
  color: #e0d8cf;
  background-color: transparent;
}

.records-view.dark .table-view :deep(.el-table__row:hover) {
  background: rgba(255, 255, 255, 0.05);
}

.records-view.dark .record-card,
.records-view.dark .record-card :deep(.el-card__header),
.records-view.dark .record-card :deep(.el-card__footer) {
  background: rgba(34, 34, 34, 0.92);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
}

.records-view.dark .patient-info h4,
.records-view.dark .info-item .label {
  color: #f8e3c2;
}

.records-view.dark .patient-meta,
.records-view.dark .info-item .value {
  color: #e0d8cf;
}

.records-view.dark :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #f5f5f5;
}

.records-view.dark :deep(.el-select-dropdown),
.records-view.dark :deep(.el-popper) {
  background: rgba(34, 34, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f5f5f5;
}

.records-view.dark :deep(.el-select-dropdown__item span),
.records-view.dark :deep(.el-date-picker__header-label),
.records-view.dark :deep(.el-date-picker__header-label span) {
  color: #f5f5f5;
}

.records-view.dark .pagination-section :deep(.el-pagination__total),
.records-view.dark .pagination-section :deep(.el-pagination__sizes),
.records-view.dark .pagination-section :deep(.el-pagination__jump) {
  color: #e0d8cf;
}

.records-view.dark .record-detail-dialog :deep(.el-dialog) {
  background: rgba(34, 34, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.records-view.dark .record-detail-dialog :deep(.el-dialog__header) {
  background: rgba(60, 60, 60, 0.95);
  color: #f5f5f5;
}

.records-view.dark .record-detail :deep(.el-descriptions) {
  background: rgba(34, 34, 34, 0.92);
  border-color: rgba(255, 255, 255, 0.08);
}

.records-view.dark .record-detail :deep(.el-descriptions__label) {
  background: rgba(255, 255, 255, 0.05);
  color: #f8e3c2;
}

.records-view.dark .record-detail :deep(.el-descriptions__content) {
  color: #e0d8cf;
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
  margin: 0 auto 32px auto;
}

.search-form {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.search-form :deep(.el-form-item) {
  margin-right: 24px;
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--tcm-primary);
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper),
.search-form :deep(.el-date-editor) {
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  box-shadow: 0 0 0 1px rgba(139, 69, 19, 0.1);
}

.search-form :deep(.el-button) {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.search-form :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* 操作区域 */
.actions-section {
  max-width: 1200px;
  margin: 0 auto 32px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 16px;
}

.right-actions {
  display: flex;
  align-items: center;
}

.actions-section :deep(.el-button) {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.actions-section :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.actions-section :deep(.el-radio-group) {
  border-radius: 12px;
  overflow: hidden;
}

.actions-section :deep(.el-radio-button__inner) {
  border-radius: 0;
  padding: 8px 16px;
}

/* 内容区域 */
.records-content {
  max-width: 1200px;
  margin: 0 auto 32px auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

/* 表格视图 */
.table-view :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.table-view :deep(.el-table__header-wrapper) {
  background: var(--tcm-primary);
}

.table-view :deep(.el-table th) {
  background: var(--tcm-primary);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.table-view :deep(.el-table td) {
  font-size: 0.95rem;
  color: var(--tcm-secondary);
}

.table-view :deep(.el-table__row:hover) {
  background: rgba(139, 69, 19, 0.05);
}

/* 卡片视图 */
.card-view :deep(.el-row) {
  margin: 0 -10px;
}

.card-view :deep(.el-col) {
  padding: 0 10px;
  margin-bottom: 20px;
}

.record-card {
  border-radius: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: var(--tcm-primary);
}

.record-card :deep(.el-card__header) {
  background: rgba(139, 69, 19, 0.05);
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 4px 0;
}

.patient-meta {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
}

.record-card :deep(.el-card__body) {
  padding: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-weight: 600;
  color: var(--tcm-primary);
  min-width: 80px;
  margin-right: 12px;
}

.info-item .value {
  color: var(--tcm-secondary);
  flex: 1;
}

.record-card :deep(.el-card__footer) {
  padding: 16px 20px;
  background: rgba(139, 69, 19, 0.03);
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.card-actions {
  display: flex;
  justify-content: space-around;
}

.card-actions :deep(.el-button) {
  padding: 8px 12px;
  font-size: 0.9rem;
}

/* 分页 */
.pagination-section {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.pagination-section :deep(.el-pagination) {
  justify-content: center;
}

.pagination-section :deep(.el-pagination__total),
.pagination-section :deep(.el-pagination__sizes),
.pagination-section :deep(.el-pagination__jump) {
  color: var(--tcm-secondary);
}

/* 详情对话框 */
.record-detail-dialog :deep(.el-dialog) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.record-detail-dialog :deep(.el-dialog__header) {
  background: var(--tcm-primary);
  color: white;
  border-radius: 20px 20px 0 0;
  margin: 0;
  padding: 24px;
}

.record-detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.record-detail-dialog :deep(.el-dialog__close) {
  color: white;
}

.record-detail {
  padding: 24px 0;
}

.record-detail :deep(.el-descriptions) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.record-detail :deep(.el-descriptions__label) {
  background: rgba(139, 69, 19, 0.05);
  color: var(--tcm-primary);
  font-weight: 600;
  width: 120px;
}

.record-detail :deep(.el-descriptions__content) {
  color: var(--tcm-secondary);
  line-height: 1.6;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .search-form {
    padding: 24px;
  }
  
  .records-content {
    padding: 24px;
  }
}

@media screen and (max-width: 768px) {
  .records-view {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .search-form {
    padding: 20px;
  }
  
  .search-form :deep(.el-form-item) {
    margin-right: 0;
    width: 100%;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .left-actions {
    justify-content: center;
  }
  
  .right-actions {
    justify-content: center;
  }
  
  .records-content {
    padding: 20px;
  }
  
  .card-view :deep(.el-col) {
    margin-bottom: 16px;
  }
  
  .record-detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .search-form,
  .records-content {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .info-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-item .label {
    min-width: auto;
    margin-right: 0;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-actions :deep(.el-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>