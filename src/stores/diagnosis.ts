import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DiagnosisRequest, DiagnosisResponse, DiagnosisWorkflowResult, PrescriptionRequest, PrescriptionResponse, MedicalRecord, PatientInfo } from '@/types/tcm'
import TCMService from '@/services/aiService'

export const useDiagnosisStore = defineStore('diagnosis', () => {
  // 状态
  const currentDiagnosis = ref<DiagnosisResponse | null>(null)
  const currentPrescription = ref<PrescriptionResponse | null>(null)
  const currentConversationId = ref<string | null>(null)
  const medicalRecords = ref<MedicalRecord[]>([])
  const isDiagnosing = ref(false)
  const isPrescribing = ref(false)
  
  // 计算属性
  const hasActiveDiagnosis = computed(() => currentDiagnosis.value !== null)
  const hasActivePrescription = computed(() => currentPrescription.value !== null)
  const recordsCount = computed(() => medicalRecords.value.length)
  
  // 获取最近的诊断记录
  const recentRecords = computed(() => {
    return [...medicalRecords.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  })
  
  // 方法
  const startDiagnosis = async (request: DiagnosisRequest): Promise<DiagnosisResponse> => {
    isDiagnosing.value = true
    
    try {
      const response = await TCMService.diagnose(request)
      currentDiagnosis.value = response
      currentConversationId.value = request.diagnosisConversationId || request.tongueFeatures?.conversationId || null
      
      // 保存到病历记录
      const record: MedicalRecord = {
        id: generateId(),
        patientId: 'current-user', // 可以从用户store获取
        patientInfo: request.patientInfo,
        symptoms: request.symptoms,
        pulse: request.pulse,
        tongue: request.tongue,
        tongueImageId: request.tongueImageId,
        tongueImageUrl: request.tongueImageUrl,
        diagnosisConversationId: currentConversationId.value || undefined,
        tongueFeatures: request.tongueFeatures,
        followUpAnswers: request.followUpAnswers,
        diagnosis: response,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      medicalRecords.value.unshift(record)
      saveToLocalStorage()
      
      return response
    } catch (error) {
      console.error('诊断失败:', error)
      throw error
    } finally {
      isDiagnosing.value = false
    }
  }

  const startDiagnosisWorkflow = async (request: DiagnosisRequest): Promise<DiagnosisWorkflowResult> => {
    isDiagnosing.value = true

    try {
      const response = await TCMService.diagnoseWithPrescription(request)
      currentDiagnosis.value = response.diagnosis
      currentPrescription.value = response.prescription
      currentConversationId.value =
        response.conversationId || request.diagnosisConversationId || request.tongueFeatures?.conversationId || null

      const record: MedicalRecord = {
        id: generateId(),
        patientId: 'current-user',
        patientInfo: request.patientInfo,
        symptoms: request.symptoms,
        pulse: request.pulse,
        tongue: request.tongue,
        tongueImageId: request.tongueImageId,
        tongueImageUrl: request.tongueImageUrl,
        diagnosisConversationId: currentConversationId.value || undefined,
        tongueFeatures: request.tongueFeatures,
        followUpAnswers: request.followUpAnswers,
        diagnosis: response.diagnosis,
        prescription: response.prescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      medicalRecords.value.unshift(record)
      saveToLocalStorage()

      return response
    } catch (error) {
      console.error('综合诊断失败:', error)
      throw error
    } finally {
      isDiagnosing.value = false
      isPrescribing.value = false
    }
  }

  const startDiagnosisWorkflowStream = async (
    request: DiagnosisRequest,
    onContent?: (fullText: string, deltaText: string) => void
  ): Promise<DiagnosisWorkflowResult> => {
    isDiagnosing.value = true

    try {
      const response = await TCMService.streamDiagnoseWithPrescription(request, onContent)
      currentDiagnosis.value = response.diagnosis
      currentPrescription.value = response.prescription
      currentConversationId.value =
        response.conversationId || request.diagnosisConversationId || request.tongueFeatures?.conversationId || null

      const record: MedicalRecord = {
        id: generateId(),
        patientId: 'current-user',
        patientInfo: request.patientInfo,
        symptoms: request.symptoms,
        pulse: request.pulse,
        tongue: request.tongue,
        tongueImageId: request.tongueImageId,
        tongueImageUrl: request.tongueImageUrl,
        diagnosisConversationId: currentConversationId.value || undefined,
        tongueFeatures: request.tongueFeatures,
        followUpAnswers: request.followUpAnswers,
        diagnosis: response.diagnosis,
        prescription: response.prescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      medicalRecords.value.unshift(record)
      saveToLocalStorage()

      return response
    } catch (error) {
      console.error('流式综合诊断失败:', error)
      throw error
    } finally {
      isDiagnosing.value = false
      isPrescribing.value = false
    }
  }
  
  const generatePrescription = async (params?: {syndrome?: string, diagnosis?: string, patientInfo?: PatientInfo, conversationId?: string}): Promise<PrescriptionResponse> => {
    // 如果提供了参数，使用参数中的信息；否则使用当前诊断结果
    let diagnosis: string
    let syndromeType: string
    let patientInfo: PatientInfo
    
    if (params) {
      diagnosis = params.diagnosis || currentDiagnosis.value?.diagnosis || ''
      syndromeType = params.syndrome || currentDiagnosis.value?.syndromeType || ''
      patientInfo = params.patientInfo || (medicalRecords.value.length > 0 
        ? medicalRecords.value[0].patientInfo 
        : { age: 30, gender: 'male' })
    } else {
      if (!currentDiagnosis.value) {
        throw new Error('请先进行诊断')
      }
      diagnosis = currentDiagnosis.value.diagnosis
      syndromeType = currentDiagnosis.value.syndromeType
      patientInfo = medicalRecords.value.length > 0 
        ? medicalRecords.value[0].patientInfo 
        : { age: 30, gender: 'male' }
    }
    
    isPrescribing.value = true
    
    try {
      const request: PrescriptionRequest = {
        diagnosis,
        syndromeType,
        patientInfo,
        conversationId: params?.conversationId || currentConversationId.value || undefined
      }
      
      const response = await TCMService.prescribe(request)
      currentPrescription.value = response
      
      // 更新当前病历记录
      if (medicalRecords.value.length > 0) {
        medicalRecords.value[0].prescription = response
        medicalRecords.value[0].updatedAt = new Date().toISOString()
        saveToLocalStorage()
      }
      
      return response
    } catch (error) {
      console.error('处方生成失败:', error)
      throw error
    } finally {
      isPrescribing.value = false
    }
  }
  
  const clearCurrentDiagnosis = () => {
    currentDiagnosis.value = null
    currentPrescription.value = null
    currentConversationId.value = null
  }
  
  const getRecordById = (id: string): MedicalRecord | undefined => {
    return medicalRecords.value.find(record => record.id === id)
  }
  
  const deleteRecord = (id: string) => {
    const index = medicalRecords.value.findIndex(record => record.id === id)
    if (index > -1) {
      medicalRecords.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  const loadRecord = (record: MedicalRecord) => {
    currentDiagnosis.value = record.diagnosis
    currentPrescription.value = record.prescription || null
    currentConversationId.value = record.diagnosisConversationId || record.tongueFeatures?.conversationId || null
  }
  
  // 本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords.value))
    } catch (error) {
      console.error('保存病历失败:', error)
    }
  }
  
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('medicalRecords')
      if (saved) {
        medicalRecords.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载病历失败:', error)
    }
  }
  
  // 生成唯一ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 初始化
  const initialize = () => {
    loadFromLocalStorage()
  }
  
  // 获取病历列表
  const getMedicalRecords = async (filters: any = {}) => {
    // 本地过滤，模拟服务端分页
    let filtered = [...medicalRecords.value]
    if (filters.patientId) {
      filtered = filtered.filter(r => r.patientId === filters.patientId)
    }
    const total = filtered.length
    const page = filters.page || 1
    const size = filters.size || 10
    const records = filtered.slice((page - 1) * size, page * size)
    return { records, total, page, size }
  }

  // 删除病历
  const deleteMedicalRecord = async (id: string) => {
    try {
      // 更新本地数据
      const index = medicalRecords.value.findIndex(record => record.id === id)
      if (index !== -1) {
        medicalRecords.value.splice(index, 1)
        saveToLocalStorage()
      }
      return true
    } catch (error) {
      console.error('删除病历失败:', error)
      throw error
    }
  }

  // 更新病历
  const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    try {
      // 更新本地数据
      const index = medicalRecords.value.findIndex(record => record.id === id)
      if (index !== -1) {
        medicalRecords.value[index] = { ...medicalRecords.value[index], ...updates, updatedAt: new Date().toISOString() }
        saveToLocalStorage()
        return medicalRecords.value[index]
      }
      throw new Error('病历不存在')
    } catch (error) {
      console.error('更新病历失败:', error)
      throw error
    }
  }

  // 重置
  const reset = () => {
    currentDiagnosis.value = null
    currentPrescription.value = null
    currentConversationId.value = null
    medicalRecords.value = []
    isDiagnosing.value = false
    isPrescribing.value = false
    localStorage.removeItem('medicalRecords')
  }
  
  return {
    // 状态
    currentDiagnosis,
    currentPrescription,
    currentConversationId,
    medicalRecords,
    isDiagnosing,
    isPrescribing,
    
    // 计算属性
    hasActiveDiagnosis,
    hasActivePrescription,
    recordsCount,
    recentRecords,
    
    // 方法
    startDiagnosis,
    startDiagnosisWorkflow,
    startDiagnosisWorkflowStream,
    generatePrescription,
    clearCurrentDiagnosis,
    getRecordById,
    deleteRecord,
    loadRecord,
    initialize,
    reset
  }
})
