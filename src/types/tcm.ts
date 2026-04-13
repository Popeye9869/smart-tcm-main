// 中医相关类型定义

export interface PatientInfo {
  age: number
  gender: 'male' | 'female'
  medicalHistory?: string
  allergies?: string[]
  currentMedications?: string[]
}

export interface TongueImageUploadResponse {
  imageId: string
  url: string
  dataUrl?: string
  fileName?: string
  mimeType?: string
  size?: number
  uploadedAt: string
}

export interface TongueAnalysisResult {
  imageId: string
  conversationId?: string
  tongueColor?: string
  tongueCoating?: string
  moisture?: string
  bodyShape?: string
  confidence: number
  summary: string
  analyzedAt: string
}

export interface FollowUpQuestion {
  id: string
  category: string
  question: string
  answerType: 'text' | 'textarea' | 'select'
  options?: string[]
  placeholder?: string
  rationale?: string
  required?: boolean
  answer?: string
}

export interface DiagnosisRequest {
  symptoms: string
  pulse?: string
  tongue?: string
  tongueImageId?: string
  tongueImageUrl?: string
  diagnosisConversationId?: string
  tongueFeatures?: TongueAnalysisResult
  followUpAnswers?: FollowUpQuestion[]
  patientInfo: PatientInfo
}

export interface DiagnosisResponse {
  diagnosis: string
  summary: string
  syndromeType: string // 证型
  treatmentPrinciple: string // 治则
  recommendations: string[]
  confidence: number
  timestamp: string
}

export interface PrescriptionRequest {
  diagnosis: string
  patientInfo: PatientInfo
  syndromeType: string
  conversationId?: string
}

export interface PrescriptionResponse {
  prescription: string
  summary: string
  mainHerbs: string[] // 主要药材
  dosage: string // 剂量
  preparation: string // 煎服法
  precautions: string[] // 注意事项
  duration: string // 疗程
  timestamp: string
}

export interface DiagnosisWorkflowResult {
  diagnosis: DiagnosisResponse
  prescription: PrescriptionResponse
  conversationId?: string
  followUpQuestions?: FollowUpQuestion[]
}

export interface TCMKnowledge {
  id: string
  category: string // 分类：基础理论、诊断、治疗、方剂等
  title: string
  content: string
  tags: string[]
  source: string
  author?: string
  createdAt: string
  updatedAt: string
}

export type KnowledgeCategory = 'herbs' | 'prescriptions' | 'acupuncture' | 'diagnosis' | 'theory'

export interface KnowledgeLink {
  id: string
  title: string
}

export interface KnowledgeItem {
  id: string
  category: KnowledgeCategory
  title: string
  description: string
  content?: string
  tags: string[]
  views: number
  likes: number
  isLiked?: boolean
  isFavorited?: boolean
  createdAt: string
  updatedAt?: string
  relatedItems?: KnowledgeLink[]
}

export interface MedicalRecord {
  id: string
  patientId: string
  patientInfo: PatientInfo
  symptoms: string
  pulse?: string
  tongue?: string
  tongueImageId?: string
  tongueImageUrl?: string
  diagnosisConversationId?: string
  tongueFeatures?: TongueAnalysisResult
  followUpAnswers?: FollowUpQuestion[]
  diagnosis: DiagnosisResponse
  prescription?: PrescriptionResponse
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  name: string
  avatar?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  medicalHistory?: string
  allergies?: string[]
  preferences: {
    language: 'zh-CN' | 'en'
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type: 'text' | 'diagnosis' | 'prescription' | 'knowledge'
}

export interface AppState {
  isLoading: boolean
  currentLanguage: 'zh-CN' | 'en'
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  notifications: boolean
}

// 枚举类型
export enum SyndromeType {
  // 八纲辨证
  EXTERIOR = '表证',
  INTERIOR = '里证',
  COLD = '寒证',
  HEAT = '热证',
  DEFICIENCY = '虚证',
  EXCESS = '实证',
  YIN = '阴证',
  YANG = '阳证',
  
  // 脏腑辨证
  HEART_QI_DEFICIENCY = '心气虚',
  HEART_BLOOD_DEFICIENCY = '心血虚',
  HEART_YIN_DEFICIENCY = '心阴虚',
  HEART_YANG_DEFICIENCY = '心阳虚',
  LIVER_QI_STAGNATION = '肝气郁结',
  LIVER_FIRE_BLAZING = '肝火上炎',
  LIVER_YANG_RISING = '肝阳上亢',
  LIVER_BLOOD_DEFICIENCY = '肝血虚',
  LIVER_YIN_DEFICIENCY = '肝阴虚',
  SPLEEN_QI_DEFICIENCY = '脾气虚',
  SPLEEN_YANG_DEFICIENCY = '脾阳虚',
  SPLEEN_QI_SINKING = '脾气下陷',
  SPLEEN_NOT_CONTROLLING_BLOOD = '脾不统血',
  LUNG_QI_DEFICIENCY = '肺气虚',
  LUNG_YIN_DEFICIENCY = '肺阴虚',
  LUNG_DRYNESS = '肺燥',
  KIDNEY_QI_DEFICIENCY = '肾气虚',
  KIDNEY_YANG_DEFICIENCY = '肾阳虚',
  KIDNEY_YIN_DEFICIENCY = '肾阴虚',
  KIDNEY_ESSENCE_DEFICIENCY = '肾精不足',
  
  // 气血津液辨证
  QI_DEFICIENCY = '气虚证',
  QI_SINKING = '气陷证',
  QI_STAGNATION = '气滞证',
  QI_REBELLION = '气逆证',
  BLOOD_DEFICIENCY = '血虚证',
  BLOOD_STASIS = '血瘀证',
  BLOOD_HEAT = '血热证',
  BLOOD_COLD = '血寒证',
  FLUID_DEFICIENCY = '津液不足证',
  FLUID_RETENTION = '津液停聚证',
  
  // 六经辨证
  TAI_YANG = '太阳病',
  YANG_MING = '阳明病',
  SHAO_YANG = '少阳病',
  TAI_YIN = '太阴病',
  SHAO_YIN = '少阴病',
  JUE_YIN = '厥阴病',
  
  // 卫气营血辨证
  WEI_LEVEL = '卫分证',
  QI_LEVEL = '气分证',
  YING_LEVEL = '营分证',
  XUE_LEVEL = '血分证',
  
  // 三焦辨证
  UPPER_JIAO = '上焦病证',
  MIDDLE_JIAO = '中焦病证',
  LOWER_JIAO = '下焦病证'
}

export enum TreatmentPrinciple {
  EXTERIOR_RELEASING = '解表法',
  INTERIOR_PURGING = '攻里法',
  WARMING_COLD = '温里法',
  CLEARING_HEAT = '清热法',
  TONIFYING_DEFICIENCY = '补益法',
  PURGING_EXCESS = '泻实法',
  HARMONIZING = '和解法',
  REGULATING_QI = '理气法',
  INVIGORATING_BLOOD = '理血法',
  DISSOLVING_PHLEGM = '祛痰法',
  ELIMINATING_DAMPNESS = '祛湿法',
  RELIEVING_COUGH = '止咳法',
  CALMING_WIND = '息风法',
  OPENING_ORIFICES = '开窍法',
  ANTHELMINTIC = '驱虫法',
  EMETIC = '涌吐法',
  ASTRINGENT = '固涩法'
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
