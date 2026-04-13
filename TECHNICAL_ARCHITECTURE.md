# 智能中医诊疗系统 - 技术架构文档

## 🏗️ 系统架构概览

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Frontend)                        │
├─────────────────────────────────────────────────────────────┤
│  Vue 3 + TypeScript + Vite + Element Plus + Pinia        │
├─────────────────────────────────────────────────────────────┤
│                    API网关层 (API Gateway)                  │
├─────────────────────────────────────────────────────────────┤
│                    业务服务层 (Backend Services)             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  诊断服务   │  病历服务   │  知识库服务 │  用户服务   │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    数据层 (Data Layer)                       │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  关系数据库  │  缓存服务   │  文件存储   │  搜索引擎   │   │
│  │ PostgreSQL  │   Redis     │   MinIO     │ Elasticsearch│   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    AI服务层 (AI Services)                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  大语言模型  │  知识图谱   │  推荐引擎   │  自然语言处理│   │
│  │   GPT-4     │  Neo4j      │  TensorFlow │   spaCy     │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 前端架构详解

### 技术栈选择
- **框架**: Vue 3.5.22 - 渐进式JavaScript框架
- **语言**: TypeScript 5.9.0 - 类型安全的JavaScript超集
- **构建工具**: Vite 7.1.7 - 快速的前端构建工具
- **UI框架**: Element Plus 2.11.4 - Vue 3组件库
- **状态管理**: Pinia 3.0.3 - Vue官方状态管理库
- **路由管理**: Vue Router 4.5.1 - Vue.js官方路由管理器
- **HTTP客户端**: Axios 1.12.2 - 基于Promise的HTTP库
- **动画**: @vueuse/motion - Vue组合式动画库
- **国际化**: Vue I18n 9.14.5 - Vue.js国际化插件

### 项目结构
```
src/
├── assets/                    # 静态资源
│   ├── images/               # 图片资源
│   ├── styles/               # 全局样式
│   └── fonts/                # 字体文件
├── components/               # 可复用组件
│   ├── common/              # 通用组件
│   ├── diagnosis/           # 诊断相关组件
│   ├── knowledge/           # 知识库组件
│   ├── records/             # 病历组件
│   └── ui/                  # UI组件
├── locales/                  # 国际化配置
│   ├── zh-CN.json           # 简体中文
│   ├── zh-TW.json           # 繁体中文
│   └── en-US.json           # 英文
├── router/                   # 路由配置
│   └── index.ts             # 路由定义
├── services/                 # API服务层
│   ├── api.ts               # API基础配置
│   ├── auth.service.ts      # 认证服务
│   ├── diagnosis.service.ts # 诊断服务
│   ├── knowledge.service.ts # 知识库服务
│   └── records.service.ts   # 病历服务
├── stores/                   # 状态管理
│   ├── auth.store.ts        # 用户认证状态
│   ├── diagnosis.store.ts   # 诊断状态
│   ├── knowledge.store.ts   # 知识库状态
│   └── records.store.ts     # 病历状态
├── types/                    # TypeScript类型定义
│   ├── auth.types.ts        # 认证相关类型
│   ├── diagnosis.types.ts   # 诊断相关类型
│   ├── knowledge.types.ts   # 知识库类型
│   └── common.types.ts      # 通用类型
├── utils/                    # 工具函数
│   ├── constants.ts         # 常量定义
│   ├── helpers.ts           # 辅助函数
│   ├── validators.ts        # 验证函数
│   └── formatters.ts        # 格式化函数
├── views/                    # 页面组件
│   ├── HomeView.vue         # 首页
│   ├── DiagnosisView.vue    # 诊断页面
│   ├── KnowledgeView.vue    # 知识库页面
│   ├── RecordsView.vue      # 病历页面
│   ├── ProfileView.vue      # 个人中心
│   └── AboutView.vue        # 关于页面
├── App.vue                   # 根组件
└── main.ts                   # 应用入口
```

### 核心模块设计

#### 1. 状态管理架构 (Pinia)
```typescript
// stores/diagnosis.store.ts
export const useDiagnosisStore = defineStore('diagnosis', {
  state: () => ({
    currentDiagnosis: null as Diagnosis | null,
    currentPrescription: null as Prescription | null,
    medicalRecords: [] as MedicalRecord[],
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    diagnosisCount: (state) => state.medicalRecords.length,
    latestDiagnosis: (state) => state.medicalRecords[0]
  },
  
  actions: {
    async startDiagnosis(patientInfo: PatientInfo) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await diagnosisService.startDiagnosis(patientInfo)
        this.currentDiagnosis = response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async generatePrescription(diagnosis: Diagnosis) {
      const response = await diagnosisService.generatePrescription(diagnosis)
      this.currentPrescription = response.data
    },
    
    saveDiagnosisRecord(record: MedicalRecord) {
      this.medicalRecords.unshift(record)
      this.persistToLocalStorage()
    },
    
    persistToLocalStorage() {
      localStorage.setItem('medicalRecords', JSON.stringify(this.medicalRecords))
    }
  }
})
```

#### 2. 路由架构 (Vue Router)
```typescript
// router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/diagnosis',
    name: 'diagnosis',
    component: () => import('@/views/DiagnosisView.vue'),
    meta: { title: '智能诊断', requiresAuth: true }
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('@/views/KnowledgeView.vue'),
    meta: { title: '中医知识库', requiresAuth: true }
  },
  {
    path: '/records',
    name: 'records',
    component: () => import('@/views/RecordsView.vue'),
    meta: { title: '病历管理', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于我们', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  }
]
```

#### 3. 服务层架构 (Axios)
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## 🤖 AI服务集成架构

### 大语言模型集成
```typescript
// services/ai.service.ts
export class AIService {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY
    this.baseURL = import.meta.env.VITE_AI_API_BASE_URL
    this.model = import.meta.env.VITE_AI_MODEL || 'gpt-4'
  }

  async diagnose(symptoms: SymptomInfo): Promise<DiagnosisResponse> {
    const prompt = this.buildDiagnosisPrompt(symptoms)
    
    try {
      const response = await this.callLLM(prompt)
      return this.parseDiagnosisResponse(response)
    } catch (error) {
      console.error('AI诊断失败:', error)
      throw new Error('AI诊断服务暂时不可用')
    }
  }

  async prescribe(diagnosis: DiagnosisResponse): Promise<PrescriptionResponse> {
    const prompt = this.buildPrescriptionPrompt(diagnosis)
    
    try {
      const response = await this.callLLM(prompt)
      return this.parsePrescriptionResponse(response)
    } catch (error) {
      console.error('AI处方生成失败:', error)
      throw new Error('AI处方服务暂时不可用')
    }
  }

  private async callLLM(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private buildDiagnosisPrompt(symptoms: SymptomInfo): string {
    return `
作为一位经验丰富的中医专家，请根据以下症状信息进行中医诊断：

主要症状：${symptoms.mainSymptoms.join(', ')}
症状描述：${symptoms.symptomDetails}
伴随症状：${symptoms.accompanyingSymptoms.join(', ')}
诱发因素：${symptoms.triggeringFactors}

四诊信息：
- 望诊：面色${symptoms.fourDiagnostics.inspection.complexion}，舌质${symptoms.fourDiagnostics.inspection.tongueColor}，舌苔${symptoms.fourDiagnostics.inspection.tongueCoating}
- 闻诊：声音${symptoms.fourDiagnostics.auscultation.voice}，呼吸${symptoms.fourDiagnostics.auscultation.breathing}
- 问诊：饮食${symptoms.fourDiagnostics.inquiry.diet}，睡眠${symptoms.fourDiagnostics.inquiry.sleep}，二便${symptoms.fourDiagnostics.inquiry.bowel}、${symptoms.fourDiagnostics.inquiry.urine}
- 切诊：脉象${symptoms.fourDiagnostics.palpation.pulse}，腹部${symptoms.fourDiagnostics.palpation.abdomen}

请提供：
1. 证型分析
2. 病因病机
3. 病位分析
4. 病性分析
5. 诊断依据

请以JSON格式返回结果。
    `.trim()
  }
}
```

### 知识图谱集成
```typescript
// services/knowledge-graph.service.ts
export class KnowledgeGraphService {
  private neo4j: Neo4jService

  async getSyndromeInfo(syndromeName: string): Promise<SyndromeInfo> {
    const query = `
      MATCH (syndrome:Syndrome {name: $syndromeName})-[r]->(related)
      RETURN syndrome, collect(related) as relatedNodes
    `
    
    const result = await this.neo4j.run(query, { syndromeName })
    return this.mapToSyndromeInfo(result)
  }

  async getHerbInfo(herbName: string): Promise<HerbInfo> {
    const query = `
      MATCH (herb:Herb {name: $herbName})-[r]->(related)
      RETURN herb, collect(related) as relatedNodes
    `
    
    const result = await this.neo4j.run(query, { herbName })
    return this.mapToHerbInfo(result)
  }

  async findSimilarCases(symptoms: string[]): Promise<MedicalCase[]> {
    const query = `
      MATCH (case:MedicalCase)-[:HAS_SYMPTOM]->(symptom:Symptom)
      WHERE symptom.name IN $symptoms
      RETURN case, count(symptom) as symptomCount
      ORDER BY symptomCount DESC
      LIMIT 10
    `
    
    const result = await this.neo4j.run(query, { symptoms })
    return result.records.map(record => this.mapToMedicalCase(record))
  }
}
```

## 🎨 UI/UX架构设计

### 设计系统架构
```css
/* assets/styles/variables.css */
:root {
  /* 中医主题色彩 */
  --tcm-primary: #8B4513;        /* 药棕色 - 主色调 */
  --tcm-secondary: #A0522D;        /* 赭石色 - 次要色 */
  --tcm-accent: #D2691E;         /* 巧克力色 - 强调色 */
  --tcm-success: #228B22;        /* 森林绿 - 成功色 */
  --tcm-warning: #DAA520;         /* 金黄色 - 警告色 */
  --tcm-error: #DC143C;          /* 深红色 - 错误色 */
  
  /* 背景色彩 */
  --tcm-background: #F5E6D3;      /* 宣纸色 - 背景色 */
  --tcm-surface: #FAF0E6;        /* 亚麻色 - 表面色 */
  --tcm-surface-variant: #F0E5D8; /* 米白色 - 表面变体 */
  
  /* 文本色彩 */
  --tcm-text-primary: #2F1B14;    /* 深棕色 - 主要文本 */
  --tcm-text-secondary: #5D4037; /* 棕褐色 - 次要文本 */
  --tcm-text-disabled: #A1887F;   /* 浅棕色 - 禁用文本 */
  
  /* 间距系统 */
  --tcm-spacing-xs: 4px;
  --tcm-spacing-sm: 8px;
  --tcm-spacing-md: 16px;
  --tcm-spacing-lg: 24px;
  --tcm-spacing-xl: 32px;
  
  /* 圆角系统 */
  --tcm-radius-sm: 4px;
  --tcm-radius-md: 8px;
  --tcm-radius-lg: 12px;
  --tcm-radius-xl: 16px;
  
  /* 阴影系统 */
  --tcm-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --tcm-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --tcm-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* 字体系统 */
  --tcm-font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --tcm-font-size-xs: 12px;
  --tcm-font-size-sm: 14px;
  --tcm-font-size-base: 16px;
  --tcm-font-size-lg: 18px;
  --tcm-font-size-xl: 20px;
  --tcm-font-size-2xl: 24px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --tcm-primary: #D2691E;
  --tcm-secondary: #CD853F;
  --tcm-background: #1E1A17;
  --tcm-surface: #2A251F;
  --tcm-surface-variant: #3A342C;
  --tcm-text-primary: #F5E6D3;
  --tcm-text-secondary: #D2B48C;
  --tcm-text-disabled: #A0826D;
}
```

### 响应式设计架构
```css
/* 断点系统 */
/* Mobile First 设计 */
.container {
  width: 100%;
  padding: 0 var(--tcm-spacing-md);
  margin: 0 auto;
}

/* 平板设备 */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
  }
  
  .grid-cols-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面设备 */
@media (min-width: 1024px) {
  .container {
    max-width: 970px;
  }
  
  .grid-cols-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 大屏幕设备 */
@media (min-width: 1200px) {
  .container {
    max-width: 1170px;
  }
  
  .grid-cols-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 超大屏幕 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}
```

### 动画系统架构
```typescript
// utils/animations.ts
export const animations = {
  // 页面过渡动画
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  
  // 卡片动画
  cardAnimation: {
    initial: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  // 列表项动画
  listItemAnimation: {
    initial: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // 按钮动画
  buttonAnimation: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 }
  },
  
  // 模态框动画
  modalAnimation: {
    initial: { opacity: 0, scale: 0.8 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}
```

## 🔧 性能优化架构

### 代码分割策略
```typescript
// vite.config.ts - 优化构建配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // UI组件库
          'ui-vendor': ['element-plus'],
          
          // 工具库
          'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
          
          // 动画库
          'animation-vendor': ['@vueuse/motion'],
          
          // 国际化
          'i18n-vendor': ['vue-i18n']
        }
      }
    },
    
    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'axios'
    ]
  }
})
```

### 图片优化策略
```typescript
// utils/image-optimization.ts
export const imageOptimization = {
  // 生成响应式图片
  generateResponsiveImage(src: string, sizes: number[]) {
    return sizes.map(size => ({
      src: `${src}?w=${size}`,
      size: `${size}w`
    }))
  },
  
  // 懒加载配置
  lazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
    loading: 'lazy'
  },
  
  // WebP支持检测
  supportsWebP(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }
}
```

### 缓存策略
```typescript
// utils/cache.ts
export class CacheManager {
  private memoryCache = new Map<string, CacheItem>()
  
  set(key: string, data: any, ttl: number = 300000) { // 默认5分钟
    const item: CacheItem = {
      data,
      expiry: Date.now() + ttl
    }
    this.memoryCache.set(key, item)
  }
  
  get(key: string): any | null {
    const item = this.memoryCache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.memoryCache.clear()
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key)
      }
    }
  }
}
```

## 🔒 安全架构

### 前端安全策略
```typescript
// utils/security.ts
export class SecurityManager {
  // XSS防护
  sanitizeInput(input: string): string {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  }
  
  // CSRF防护
  getCSRFToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    return token || ''
  }
  
  // 敏感数据加密
  encryptData(data: string, key: string): string {
    // 实现简单的加密逻辑
    return btoa(data + key)
  }
  
  // 数据脱敏
  maskSensitiveData(data: string, type: 'phone' | 'email' | 'id'): string {
    switch (type) {
      case 'phone':
        return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      case 'email':
        return data.replace(/(.{2}).+(.{2}@.+)/, '$1****$2')
      case 'id':
        return data.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
      default:
        return data
    }
  }
}
```

### 认证授权架构
```typescript
// services/auth.service.ts
export class AuthService {
  private token: string | null = null
  private refreshToken: string | null = null
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, refreshToken, user } = response.data
      
      this.token = token
      this.refreshToken = refreshToken
      
      // 存储到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token, refreshToken, user }
    } catch (error) {
      throw new Error('登录失败')
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: this.refreshToken
      })
      
      const { token } = response.data
      this.token = token
      localStorage.setItem('token', token)
      
      return token
    } catch (error) {
      // 刷新失败，需要重新登录
      this.logout()
      throw new Error('需要重新登录')
    }
  }
  
  logout(): void {
    this.token = null
    this.refreshToken = null
    localStorage.clear()
    router.push('/login')
  }
  
  getToken(): string | null {
    return this.token || localStorage.getItem('token')
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
```

## 📊 数据架构

### 数据模型设计
```typescript
// types/diagnosis.types.ts
export interface Diagnosis {
  id: string
  patientInfo: PatientInfo
  symptoms: SymptomInfo
  fourDiagnostics: FourDiagnostics
  aiAnalysis: AIAnalysis
  result: DiagnosisResult
  prescription: Prescription
  treatmentPlan: TreatmentPlan
  createdAt: string
  updatedAt: string
}

export interface PatientInfo {
  name: string
  age: number
  gender: 'male' | 'female'
  medicalHistory: string[]
  allergies: string[]
  constitutionType?: ConstitutionType
}

export interface SymptomInfo {
  mainSymptoms: string[]
  symptomDetails: string
  accompanyingSymptoms: string[]
  triggeringFactors: string
  severity: 1 | 2 | 3 | 4 | 5
}

export interface FourDiagnostics {
  inspection: InspectionInfo
  auscultation: AuscultationInfo
  inquiry: InquiryInfo
  palpation: PalpationInfo
}

export interface AIAnalysis {
  syndromeType: string
  etiology: string
  pathogenesis: string
  diseaseLocation: string[]
  diseaseNature: string[]
  diagnosisBasis: string[]
  confidence: number
  similarCases: MedicalCase[]
}
```

### 数据持久化策略
```typescript
// utils/storage.ts
export class StorageManager {
  // 本地存储
  static setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('LocalStorage设置失败:', error)
    }
  }
  
  static getItem(key: string): any | null {
    try {
      const serializedValue = localStorage.getItem(key)
      return serializedValue ? JSON.parse(serializedValue) : null
    } catch (error) {
      console.error('LocalStorage获取失败:', error)
      return null
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(key)
  }
  
  static clear(): void {
    localStorage.clear()
  }
  
  // 会话存储
  static setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('SessionStorage设置失败:', error)
    }
  }
  
  static getSessionItem(key: string): any | null {
    try {
      const serializedValue = sessionStorage.getItem(key)
      return serializedValue ? JSON.parse(serializedValue) : null
    } catch (error) {
      console.error('SessionStorage获取失败:', error)
      return null
    }
  }
}
```

## 🧪 测试架构

### 单元测试架构
```typescript
// tests/unit/components/DiagnosisForm.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DiagnosisForm from '@/components/diagnosis/DiagnosisForm.vue'

describe('DiagnosisForm', () => {
  it('应该正确渲染症状输入表单', () => {
    const wrapper = mount(DiagnosisForm)
    
    expect(wrapper.find('[data-testid="symptom-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true)
  })
  
  it('应该在表单提交时触发诊断事件', async () => {
    const wrapper = mount(DiagnosisForm)
    const symptomInput = wrapper.find('[data-testid="symptom-input"]')
    
    await symptomInput.setValue('头痛')
    await wrapper.find('[data-testid="submit-button"]').trigger('click')
    
    expect(wrapper.emitted('diagnose')).toBeTruthy()
    expect(wrapper.emitted('diagnose')![0]).toEqual(['头痛'])
  })
  
  it('应该在输入为空时显示错误信息', async () => {
    const wrapper = mount(DiagnosisForm)
    
    await wrapper.find('[data-testid="submit-button"]').trigger('click')
    
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="error-message"]').text()).toContain('请输入症状')
  })
})
```

### 集成测试架构
```typescript
// tests/integration/diagnosis.integration.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDiagnosisStore } from '@/stores/diagnosis.store'
import { diagnosisService } from '@/services/diagnosis.service'

vi.mock('@/services/diagnosis.service', () => ({
  diagnosisService: {
    startDiagnosis: vi.fn(),
    generatePrescription: vi.fn()
  }
}))

describe('诊断流程集成测试', () => {
  let diagnosisStore: ReturnType<typeof useDiagnosisStore>
  
  beforeEach(() => {
    setActivePinia(createPinia())
    diagnosisStore = useDiagnosisStore()
  })
  
  it('应该完成完整的诊断流程', async () => {
    const mockPatientInfo = {
      name: '张三',
      age: 35,
      gender: 'male' as const,
      medicalHistory: [],
      allergies: []
    }
    
    const mockSymptoms = {
      mainSymptoms: ['头痛'],
      symptomDetails: '头痛剧烈',
      accompanyingSymptoms: [],
      triggeringFactors: '受凉'
    }
    
    // 模拟AI服务响应
    vi.mocked(diagnosisService.startDiagnosis).mockResolvedValue({
      data: {
        id: 'diag_123',
        syndromeType: '肝阳上亢证',
        confidence: 0.85
      }
    })
    
    // 开始诊断
    await diagnosisStore.startDiagnosis(mockPatientInfo)
    
    expect(diagnosisStore.currentDiagnosis).toBeTruthy()
    expect(diagnosisStore.currentDiagnosis?.syndromeType).toBe('肝阳上亢证')
  })
})
```

## 📈 监控与分析架构

### 性能监控
```typescript
// utils/analytics.ts
export class AnalyticsManager {
  private static instance: AnalyticsManager
  
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager()
    }
    return AnalyticsManager.instance
  }
  
  trackPageView(page: string): void {
    if (import.meta.env.PROD) {
      this.sendAnalytics('page_view', { page })
    }
  }
  
  trackEvent(event: string, properties: Record<string, any>): void {
    if (import.meta.env.PROD) {
      this.sendAnalytics(event, properties)
    }
  }
  
  trackPerformance(): void {
    if (import.meta.env.PROD && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      this.sendAnalytics('performance', {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint()
      })
    }
  }
  
  private sendAnalytics(event: string, properties: Record<string, any>): void {
    navigator.sendBeacon('/api/analytics', JSON.stringify({
      event,
      properties,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }))
  }
  
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : 0
  }
}
```

### 错误监控
```typescript
// utils/error-tracking.ts
export class ErrorTracker {
  static init(): void {
    // 全局错误处理
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })
    
    // Promise拒绝处理
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack
      })
    })
    
    // Vue错误处理
    app.config.errorHandler = (error, instance, info) => {
      this.trackError({
        type: 'vue',
        message: error.message,
        stack: error.stack,
        component: instance?.$options.name,
        info
      })
    }
  }
  
  static trackError(error: ErrorInfo): void {
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/errors', JSON.stringify({
        ...error,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }))
    } else {
      console.error('Error tracked:', error)
    }
  }
}
```

---

**传承千年中医智慧，融合现代科技力量** 🌿✨

本文档详细阐述了智能中医诊疗系统的技术架构设计，包括前端架构、AI服务集成、UI/UX设计、性能优化、安全架构、数据架构、测试架构和监控分析等各个方面，为系统的开发和维护提供全面的技术指导。