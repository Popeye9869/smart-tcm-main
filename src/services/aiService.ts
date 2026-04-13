import axios from 'axios'
import type {
  DiagnosisRequest,
  DiagnosisResponse,
  DiagnosisWorkflowResult,
  FollowUpQuestion,
  PrescriptionRequest,
  PrescriptionResponse,
  TongueAnalysisResult,
  TongueImageUploadResponse
} from '@/types/tcm'

// 大模型API配置
const API_CONFIG = {
  baseURL: 'https://api.moonshot.cn/v1', // Moonshot API地址
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-axkZxCTZPzpmt33yKAMuezsYz2KaFf02pBGk2s5YGl5fyVlA',
  model: 'kimi-k2.5', // Moonshot模型
  timeout: 3000000 // 30秒超时
}

const AI_REQUEST_MIN_INTERVAL_MS = Number(import.meta.env.VITE_MOONSHOT_REQUEST_INTERVAL_MS || 8000)
const AI_REQUEST_BASE_RETRY_MS = Number(import.meta.env.VITE_MOONSHOT_RETRY_MS || 8000)
const AI_REQUEST_MAX_RETRIES = 2

type MoonshotMessageContent = string | Array<Record<string, unknown>>

interface MoonshotMessage {
  role: 'system' | 'user' | 'assistant'
  content: MoonshotMessageContent
}

class MoonshotHttpError extends Error {
  status: number
  headers: Headers
  responseBody: string

  constructor(status: number, responseBody: string, headers: Headers) {
    super(`Moonshot HTTP Error ${status}`)
    this.name = 'MoonshotHttpError'
    this.status = status
    this.headers = headers
    this.responseBody = responseBody
  }
}

const DIAGNOSIS_CONVERSATION_SYSTEM_PROMPT = `你是一名中医诊疗助手。
本轮会话可能分成多个阶段：先做舌象分析，再结合症状、脉象、舌象做综合辨证，最后给出处方建议。
要求：
1. 必须继承前文上下文，不要忽略已经完成的舌象分析结果。
2. 当用户明确要求“只返回 JSON”时，只返回 JSON 对象，不要输出 Markdown。
3. 当用户要求综合诊断或处方时，结合前文信息继续回答，不要把会话重置为新病例。`

const TONGUE_COLOR_ALIASES: Record<string, string> = {
  pale_red: 'pale_red',
  '淡红': 'pale_red',
  '淡红舌': 'pale_red',
  pale_white: 'pale_white',
  '淡白': 'pale_white',
  '淡白舌': 'pale_white',
  red: 'red',
  '红': 'red',
  '红舌': 'red',
  crimson: 'crimson',
  '绛': 'crimson',
  '绛舌': 'crimson',
  purple: 'purple',
  '紫': 'purple',
  '紫舌': 'purple'
}

const TONGUE_COATING_ALIASES: Record<string, string> = {
  thin_white: 'thin_white',
  '薄白': 'thin_white',
  '薄白苔': 'thin_white',
  thin_yellow: 'thin_yellow',
  '薄黄': 'thin_yellow',
  '薄黄苔': 'thin_yellow',
  thick_white: 'thick_white',
  '厚白': 'thick_white',
  '厚白苔': 'thick_white',
  thick_yellow: 'thick_yellow',
  '厚黄': 'thick_yellow',
  '厚黄苔': 'thick_yellow',
  greasy: 'greasy',
  '腻': 'greasy',
  '腻苔': 'greasy',
  scarce: 'scarce',
  '少苔': 'scarce',
  none: 'none',
  '无苔': 'none'
}

const MOISTURE_ALIASES: Record<string, string> = {
  dry: 'dry',
  '干': 'dry',
  '干燥': 'dry',
  normal: 'normal',
  '正常': 'normal',
  '适中': 'normal',
  '润': 'normal',
  wet: 'wet',
  '湿': 'wet',
  '湿润': 'wet'
}

const BODY_SHAPE_ALIASES: Record<string, string> = {
  thin: 'thin',
  '瘦薄': 'thin',
  '瘦小': 'thin',
  normal: 'normal',
  '正常': 'normal',
  '适中': 'normal',
  swollen: 'swollen',
  '胖大': 'swollen',
  '胖嫩': 'swollen',
  teeth_marked: 'teeth_marked',
  '齿痕': 'teeth_marked',
  '齿痕舌': 'teeth_marked',
  cracked: 'cracked',
  '裂纹': 'cracked',
  '裂纹舌': 'cracked'
}

function normalizeAliasKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function sanitizeLogValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.startsWith('Bearer ')) {
      return 'Bearer ***'
    }

    if (value.startsWith('data:image/')) {
      return `[image data url omitted, length=${value.length}]`
    }

    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeLogValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        key.toLowerCase() === 'authorization' ? 'Bearer ***' : sanitizeLogValue(item)
      ])
    )
  }

  return value
}

function extractMoonshotErrorMessage(error: unknown): string | undefined {
  if (error instanceof MoonshotHttpError) {
    if (!error.responseBody.trim()) {
      return undefined
    }

    try {
      const parsed = JSON.parse(error.responseBody) as Record<string, unknown>
      const errorMessage =
        parsed.error && typeof parsed.error === 'object'
          ? (parsed.error as Record<string, unknown>).message
          : parsed.message

      return typeof errorMessage === 'string' && errorMessage.trim()
        ? errorMessage.trim()
        : error.responseBody.trim()
    } catch {
      return error.responseBody.trim()
    }
  }

  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const responseData = error.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim()
  }

  if (responseData && typeof responseData === 'object') {
    const errorMessage =
      (responseData as Record<string, unknown>).error &&
      typeof (responseData as Record<string, unknown>).error === 'object'
        ? ((responseData as Record<string, unknown>).error as Record<string, unknown>).message
        : undefined

    if (typeof errorMessage === 'string' && errorMessage.trim()) {
      return errorMessage.trim()
    }

    const message = (responseData as Record<string, unknown>).message
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
  }

  return undefined
}

// 创建axios实例
const DIAGNOSIS_API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
}

const aiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.apiKey}`
  }
})

const diagnosisClient = axios.create({
  baseURL: DIAGNOSIS_API_CONFIG.baseURL,
  timeout: DIAGNOSIS_API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
aiClient.interceptors.request.use(
  (config) => {
    console.log('AI Request URL:', `${config.baseURL ?? ''}${config.url ?? ''}`)
    console.log('AI Request Headers:', sanitizeLogValue(config.headers))
    console.log('AI Request Data:', sanitizeLogValue(config.data))
    return config
  },
  (error) => {
    console.error('AI Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
aiClient.interceptors.response.use(
  (response) => {
    console.log('AI Response Status:', response.status)
    console.log('AI Response Data:', sanitizeLogValue(response.data))
    return response
  },
  (error) => {
    console.error('AI Response Error:', error)
    console.error('Error Response:', error.response?.data)
    console.error('Error Status:', error.response?.status)
    console.error('Error Headers:', error.response?.headers)
    return Promise.reject(error)
  }
)

export class TCMService {
  private static aiRequestTail: Promise<unknown> = Promise.resolve()
  private static aiNextAvailableAt = 0
  private static diagnosisConversations = new Map<string, MoonshotMessage[]>()
  private static activeDiagnosisConversationId: string | null = null

  private static getSeasonName(month: number): string {
    if (month >= 3 && month <= 5) {
      return '春季'
    }

    if (month >= 6 && month <= 8) {
      return '夏季'
    }

    if (month >= 9 && month <= 11) {
      return '秋季'
    }

    return '冬季'
  }

  private static buildSeasonContext(now: Date = new Date()): string {
    const month = now.getMonth() + 1
    const day = now.getDate()
    const season = this.getSeasonName(month)

    return `当前就诊时间为 ${month}月${day}日，属于${season}。在输出治疗建议、调护建议、处方加减、煎服方法和注意事项时，请结合该季节的时令特点，给出与当前辨证一致的饮食、起居、情志和外感防护建议，但不要脱离当前证型与病机。`
  }

  private static createTempTongueImageId(): string {
    return `tongue_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }

  private static cloneMessage(message: MoonshotMessage): MoonshotMessage {
    return {
      role: message.role,
      content: typeof message.content === 'string'
        ? message.content
        : message.content.map(item => ({ ...item }))
    }
  }

  private static cloneMessages(messages: MoonshotMessage[]): MoonshotMessage[] {
    return messages.map(message => this.cloneMessage(message))
  }

  private static saveDiagnosisConversation(conversationId: string, messages: MoonshotMessage[]): void {
    this.diagnosisConversations.set(conversationId, this.cloneMessages(messages))
    this.activeDiagnosisConversationId = conversationId
  }

  private static getDiagnosisConversation(conversationId?: string): MoonshotMessage[] {
    if (!conversationId) {
      return []
    }

    const history = this.diagnosisConversations.get(conversationId)
    return history ? this.cloneMessages(history) : []
  }

  private static createDiagnosisConversationId(seed?: string): string {
    return seed || `diagnosis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }

  private static buildDiagnosisConversationSeedMessages(): MoonshotMessage[] {
    return [
      {
        role: 'system',
        content: DIAGNOSIS_CONVERSATION_SYSTEM_PROMPT
      }
    ]
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms))
  }

  private static isRateLimitError(error: unknown): boolean {
    if (error instanceof MoonshotHttpError) {
      return error.status === 429
    }

    return axios.isAxiosError(error) && error.response?.status === 429
  }

  private static getHeaderValue(error: unknown, headerName: string): string | undefined {
    if (error instanceof MoonshotHttpError) {
      return error.headers.get(headerName) || undefined
    }

    if (!axios.isAxiosError(error)) {
      return undefined
    }

    const headers = error.response?.headers as Record<string, unknown> | undefined
    if (!headers) {
      return undefined
    }

    const matchedEntry = Object.entries(headers).find(([key]) => key.toLowerCase() === headerName.toLowerCase())
    const headerValue = matchedEntry?.[1]

    if (typeof headerValue === 'string') {
      return headerValue
    }

    if (Array.isArray(headerValue) && typeof headerValue[0] === 'string') {
      return headerValue[0]
    }

    if (headerValue !== undefined && headerValue !== null) {
      return String(headerValue)
    }

    return undefined
  }

  private static parseRetryAfterMs(value: string | undefined): number | undefined {
    if (!value) {
      return undefined
    }

    const seconds = Number(value)
    if (Number.isFinite(seconds)) {
      return Math.max(0, seconds * 1000)
    }

    const retryAt = Date.parse(value)
    if (!Number.isNaN(retryAt)) {
      return Math.max(0, retryAt - Date.now())
    }

    return undefined
  }

  private static getRetryDelayMs(error: unknown, attempt: number): number {
    const retryAfterMs = this.parseRetryAfterMs(this.getHeaderValue(error, 'retry-after'))
    if (retryAfterMs !== undefined) {
      return retryAfterMs
    }

    return AI_REQUEST_BASE_RETRY_MS * (attempt + 1)
  }

  private static formatAIError(error: unknown): Error {
    const apiErrorMessage = extractMoonshotErrorMessage(error)

    if (error instanceof MoonshotHttpError) {
      if (error.status === 401) {
        return new Error('API密钥无效，请检查配置')
      }

      if (error.status === 400) {
        return new Error(`Moonshot 请求参数错误: ${apiErrorMessage || '请检查请求体'}`)
      }

      if (error.status === 429) {
        return new Error(`请求过于频繁，请稍后再试${apiErrorMessage ? `: ${apiErrorMessage}` : ''}`)
      }

      return new Error(`AI服务暂时不可用: ${apiErrorMessage || error.message || '未知错误'}`)
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return new Error('API密钥无效，请检查配置')
      }

      if (error.response?.status === 400) {
        return new Error(`Moonshot 请求参数错误: ${apiErrorMessage || error.message || '请检查请求体'}`)
      }

      if (error.response?.status === 429) {
        return new Error(`请求过于频繁，请稍后再试${apiErrorMessage ? `: ${apiErrorMessage}` : ''}`)
      }

      if (error.code === 'ECONNABORTED') {
        return new Error('请求超时，请检查网络连接')
      }

      return new Error(`AI服务暂时不可用: ${apiErrorMessage || error.message || '未知错误'}`)
    }

    if (error instanceof Error) {
      return error
    }

    return new Error('AI服务暂时不可用: 未知错误')
  }

  private static async executeWithRetry<T>(task: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= AI_REQUEST_MAX_RETRIES; attempt++) {
      try {
        return await task()
      } catch (error) {
        if (!this.isRateLimitError(error) || attempt === AI_REQUEST_MAX_RETRIES) {
          throw this.formatAIError(error)
        }

        const retryDelayMs = this.getRetryDelayMs(error, attempt)
        console.warn(`Moonshot 触发限流，${retryDelayMs}ms 后进行第 ${attempt + 1} 次重试。`)
        this.aiNextAvailableAt = Math.max(this.aiNextAvailableAt, Date.now() + retryDelayMs)
        await this.sleep(retryDelayMs)
      }
    }

    throw new Error('AI服务暂时不可用: 重试次数已用尽')
  }

  private static enqueueAIRequest<T>(task: () => Promise<T>): Promise<T> {
    const scheduledTask = this.aiRequestTail.then(async () => {
      const waitMs = Math.max(0, this.aiNextAvailableAt - Date.now())

      if (waitMs > 0) {
        await this.sleep(waitMs)
      }

      this.aiNextAvailableAt = Date.now() + AI_REQUEST_MIN_INTERVAL_MS
      return this.executeWithRetry(task)
    })

    this.aiRequestTail = scheduledTask.then(
      () => undefined,
      () => undefined
    )

    return scheduledTask
  }

  private static postChatCompletion(payload: Record<string, unknown>) {
    return this.enqueueAIRequest(() => aiClient.post('/chat/completions', payload))
  }

  private static async streamChatCompletion(
    payload: Record<string, unknown>,
    onContent?: (fullText: string, deltaText: string) => void
  ): Promise<string> {
    return this.enqueueAIRequest(async () => {
      const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          ...payload,
          stream: true
        })
      })

      if (!response.ok) {
        throw new MoonshotHttpError(response.status, await response.text(), response.headers)
      }

      if (!response.body) {
        throw new Error('AI服务未返回可读取的数据流')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullText = ''

      while (true) {
        const { value, done } = await reader.read()
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, '\n')

        let separatorIndex = buffer.indexOf('\n\n')
        while (separatorIndex !== -1) {
          const block = buffer.slice(0, separatorIndex).trim()
          buffer = buffer.slice(separatorIndex + 2)

          if (block) {
            const dataLines = block
              .split('\n')
              .filter(line => line.startsWith('data: '))
              .map(line => line.slice(6).trim())

            for (const dataLine of dataLines) {
              if (!dataLine) {
                continue
              }

              if (dataLine === '[DONE]') {
                return fullText
              }

              const chunk = JSON.parse(dataLine) as {
                choices?: Array<{
                  delta?: {
                    content?: string
                  }
                }>
              }
              const deltaText = chunk.choices?.[0]?.delta?.content

              if (deltaText) {
                fullText += deltaText
                onContent?.(fullText, deltaText)
              }
            }
          }

          separatorIndex = buffer.indexOf('\n\n')
        }

        if (done) {
          break
        }
      }

      return fullText
    })
  }

  private static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('图片读取失败：未生成可用的数据内容'))
      }

      reader.onerror = () => {
        reject(new Error('图片读取失败，请重新上传'))
      }

      reader.readAsDataURL(file)
    })
  }

  private static normalizeMappedValue(
    value: unknown,
    aliasMap: Record<string, string>
  ): string | undefined {
    if (typeof value !== 'string') {
      return undefined
    }

    const normalized = normalizeAliasKey(value)

    if (normalized === 'unknown' || normalized === '无法判断') {
      return undefined
    }

    return aliasMap[normalized]
  }

  private static normalizeConfidence(value: unknown): number {
    const numericValue = typeof value === 'number' ? value : Number(value)

    if (Number.isNaN(numericValue)) {
      return 0.6
    }

    return Math.min(1, Math.max(0, numericValue))
  }

  private static normalizeStringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
      return fallback
    }

    const normalized = value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)

    return normalized.length > 0 ? normalized : fallback
  }

  private static normalizeFollowUpQuestions(value: unknown): FollowUpQuestion[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .filter(item => {
        const category = typeof item.category === 'string' ? item.category.trim() : ''
        const question = typeof item.question === 'string' ? item.question.trim() : ''
        return category !== '无' && !question.includes('无需进一步问诊')
      })
      .map((item, index) => {
        const options = this.normalizeStringArray(item.options, [])
        const answerType =
          item.answerType === 'select' || item.answerType === 'textarea'
            ? item.answerType
            : options.length > 0
              ? 'select'
              : 'text'

        return {
          id:
            typeof item.id === 'string' && item.id.trim()
              ? item.id.trim()
              : `follow_up_${index + 1}`,
          category:
            typeof item.category === 'string' && item.category.trim()
              ? item.category.trim()
              : '补充问诊',
          question:
            typeof item.question === 'string' && item.question.trim()
              ? item.question.trim()
              : '请补充相关信息',
          answerType,
          options,
          placeholder:
            typeof item.placeholder === 'string' && item.placeholder.trim()
              ? item.placeholder.trim()
              : answerType === 'select'
                ? '请选择'
                : '请输入补充信息',
          rationale:
            typeof item.rationale === 'string' && item.rationale.trim()
              ? item.rationale.trim()
              : '用于进一步完善辨证结论',
          required: item.required !== false,
          answer:
            typeof item.answer === 'string' && item.answer.trim()
              ? item.answer.trim()
              : ''
        } satisfies FollowUpQuestion
      })
      .slice(0, 6)
  }

  private static summarizeTongueAnalysis(tongueFeatures?: TongueAnalysisResult): string {
    if (!tongueFeatures) {
      return '未提供舌象AI结论'
    }

    const segments = [
      tongueFeatures.tongueColor ? `舌质=${tongueFeatures.tongueColor}` : '',
      tongueFeatures.tongueCoating ? `舌苔=${tongueFeatures.tongueCoating}` : '',
      tongueFeatures.moisture ? `津液=${tongueFeatures.moisture}` : '',
      tongueFeatures.bodyShape ? `舌体=${tongueFeatures.bodyShape}` : '',
      tongueFeatures.summary ? `结论=${tongueFeatures.summary}` : ''
    ].filter(Boolean)

    return segments.length > 0 ? segments.join('；') : '未提供舌象AI结论'
  }

  private static createTongueAnalysisContextMessage(tongueFeatures: TongueAnalysisResult): MoonshotMessage {
    return {
      role: 'assistant',
      content: `已完成舌象分析，结构化结论如下：${this.summarizeTongueAnalysis(tongueFeatures)}。请后续诊断和处方直接继承此结论，不要再次请求或引用原始图片。`
    }
  }

  private static summarizeFollowUpAnswers(followUpAnswers?: FollowUpQuestion[]): string {
    if (!followUpAnswers || followUpAnswers.length === 0) {
      return '未补充进一步问诊答案'
    }

    const answeredItems = followUpAnswers
      .filter(item => typeof item.answer === 'string' && item.answer.trim())
      .map(item => `${item.category} / ${item.question}：${item.answer?.trim()}`)

    return answeredItems.length > 0 ? answeredItems.join('\n') : '未补充进一步问诊答案'
  }

  private static parseJsonObject(content: unknown): Record<string, unknown> {
    const rawText = typeof content === 'string' ? content.trim() : JSON.stringify(content)
    const normalizedText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    const jsonMatch = normalizedText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('AI返回结果不是有效的JSON')
    }

    return JSON.parse(jsonMatch[0]) as Record<string, unknown>
  }

  private static parseTongueAnalysisResult(
    content: unknown,
    imageId: string
  ): TongueAnalysisResult {
    const parsed = this.parseJsonObject(content)
    const summary =
      typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : '舌象分析完成'

    return {
      imageId,
      tongueColor: this.normalizeMappedValue(parsed.tongueColor, TONGUE_COLOR_ALIASES),
      tongueCoating: this.normalizeMappedValue(parsed.tongueCoating, TONGUE_COATING_ALIASES),
      moisture: this.normalizeMappedValue(parsed.moisture, MOISTURE_ALIASES),
      bodyShape: this.normalizeMappedValue(parsed.bodyShape, BODY_SHAPE_ALIASES),
      confidence: this.normalizeConfidence(parsed.confidence),
      summary,
      analyzedAt: new Date().toISOString()
    }
  }

  private static parseDiagnosisWorkflowResult(content: unknown): DiagnosisWorkflowResult {
    const parsed = this.parseJsonObject(content)
    const diagnosisPayload =
      parsed.diagnosis && typeof parsed.diagnosis === 'object'
        ? parsed.diagnosis as Record<string, unknown>
        : {}
    const prescriptionPayload =
      parsed.prescription && typeof parsed.prescription === 'object'
        ? parsed.prescription as Record<string, unknown>
        : {}

    const diagnosis: DiagnosisResponse = {
      diagnosis:
        typeof diagnosisPayload.diagnosis === 'string' && diagnosisPayload.diagnosis.trim()
          ? diagnosisPayload.diagnosis.trim()
          : '中医诊断结果待补充',
      summary:
        typeof diagnosisPayload.summary === 'string' && diagnosisPayload.summary.trim()
          ? diagnosisPayload.summary.trim()
          : '中医诊断结果',
      syndromeType:
        typeof diagnosisPayload.syndromeType === 'string' && diagnosisPayload.syndromeType.trim()
          ? diagnosisPayload.syndromeType.trim()
          : '需进一步辨证',
      treatmentPrinciple:
        typeof diagnosisPayload.treatmentPrinciple === 'string' && diagnosisPayload.treatmentPrinciple.trim()
          ? diagnosisPayload.treatmentPrinciple.trim()
          : '辨证施治',
      recommendations: this.normalizeStringArray(diagnosisPayload.recommendations, ['注意休息', '饮食调护', '情志调节']),
      confidence: this.normalizeConfidence(diagnosisPayload.confidence),
      timestamp: new Date().toISOString()
    }

    const prescriptionText =
      typeof prescriptionPayload.prescription === 'string' && prescriptionPayload.prescription.trim()
        ? prescriptionPayload.prescription.trim()
        : `方药建议：${this.normalizeStringArray(prescriptionPayload.mainHerbs, ['需根据具体情况配伍']).join('、')}`

    const prescription: PrescriptionResponse = {
      prescription: prescriptionText,
      summary:
        typeof prescriptionPayload.summary === 'string' && prescriptionPayload.summary.trim()
          ? prescriptionPayload.summary.trim()
          : '中药处方推荐',
      mainHerbs: this.normalizeStringArray(prescriptionPayload.mainHerbs, ['需根据具体情况配伍']),
      dosage:
        typeof prescriptionPayload.dosage === 'string' && prescriptionPayload.dosage.trim()
          ? prescriptionPayload.dosage.trim()
          : '遵医嘱',
      preparation:
        typeof prescriptionPayload.preparation === 'string' && prescriptionPayload.preparation.trim()
          ? prescriptionPayload.preparation.trim()
          : '水煎服',
      precautions: this.normalizeStringArray(prescriptionPayload.precautions, ['遵医嘱服用', '注意饮食禁忌']),
      duration:
        typeof prescriptionPayload.duration === 'string' && prescriptionPayload.duration.trim()
          ? prescriptionPayload.duration.trim()
          : '7-14天',
      timestamp: new Date().toISOString()
    }

    return {
      diagnosis,
      prescription,
      followUpQuestions: this.normalizeFollowUpQuestions(parsed.followUpQuestions)
    }
  }

  private static extractSection(text: string, sectionName: string): string {
    const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`【${escapedSectionName}】\\s*([\\s\\S]*?)(?=\\n【|$)`)
    const match = text.match(regex)
    return match && match[1] ? match[1].trim() : ''
  }

  private static parseBulletList(text: string, fallback: string[]): string[] {
    const items = text
      .split('\n')
      .map(line => line.replace(/^[-*•\d.\s]+/, '').trim())
      .filter(Boolean)

    return items.length > 0 ? items : fallback
  }

  private static parseFollowUpTable(text: string): FollowUpQuestion[] {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => line.includes('|'))
      .filter(line => !/^\|?\s*-{2,}/.test(line))

    const questions: FollowUpQuestion[] = []

    for (const line of lines) {
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(Boolean)

      if (cells.length < 6) {
        continue
      }

      if (cells[0] === '分类' || cells[1] === '问题') {
        continue
      }

      if (cells[0] === '无' || cells[1]?.includes('无需进一步问诊')) {
        continue
      }

      const options = cells[3] && cells[3] !== '无'
        ? cells[3].split('/').map(item => item.trim()).filter(Boolean)
        : []

      const answerType =
        cells[2] === 'select' || cells[2] === 'textarea'
          ? cells[2]
          : options.length > 0
            ? 'select'
            : 'text'

      questions.push({
        id: `follow_up_${questions.length + 1}`,
        category: cells[0] || '补充问诊',
        question: cells[1] || '请补充相关信息',
        answerType,
        options,
        placeholder: cells[4] && cells[4] !== '无' ? cells[4] : (answerType === 'select' ? '请选择' : '请输入补充信息'),
        rationale: cells[5] && cells[5] !== '无' ? cells[5] : '用于进一步完善辨证结论',
        required: true,
        answer: ''
      })
    }

    return questions.slice(0, 6)
  }

  private static parseDiagnosisWorkflowText(text: string): DiagnosisWorkflowResult {
    const summary = this.extractSection(text, '诊断摘要') || '中医诊断结果'
    const syndromeType = this.extractSection(text, '证型') || this.extractSyndromeType(text)
    const pathogenesis = this.extractSection(text, '病因病机') || text
    const treatmentPrinciple = this.extractSection(text, '治则') || this.extractTreatmentPrinciple(text)
    const recommendations = this.parseBulletList(
      this.extractSection(text, '调护建议'),
      ['注意休息', '饮食调护', '情志调节']
    )
    const prescriptionSummary = this.extractSection(text, '处方摘要') || '中药处方推荐'
    const prescriptionDetail = this.extractSection(text, '完整处方') || text
    const mainHerbs = this.parseBulletList(
      this.extractSection(text, '主要药材'),
      this.extractHerbs(text)
    )
    const dosage = this.extractSection(text, '剂量') || this.extractDosage(text)
    const preparation = this.extractSection(text, '煎服法') || this.extractPreparation(text)
    const precautions = this.parseBulletList(
      this.extractSection(text, '注意事项'),
      this.extractPrecautions(text)
    )
    const duration = this.extractSection(text, '疗程') || this.extractDuration(text)
    const followUpQuestions = this.parseFollowUpTable(this.extractSection(text, '进一步问诊表'))

    return {
      diagnosis: {
        diagnosis: `证型：${syndromeType}\n病因病机：${pathogenesis}\n治则：${treatmentPrinciple}`,
        summary,
        syndromeType,
        treatmentPrinciple,
        recommendations,
        confidence: 0.8,
        timestamp: new Date().toISOString()
      },
      prescription: {
        prescription: prescriptionDetail,
        summary: prescriptionSummary,
        mainHerbs,
        dosage,
        preparation,
        precautions,
        duration,
        timestamp: new Date().toISOString()
      },
      followUpQuestions
    }
  }

  /**
   * 舌苔图片上传
   */
  static async uploadTongueImage(file: File): Promise<TongueImageUploadResponse> {
    const dataUrl = await this.fileToDataUrl(file)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await diagnosisClient.post('/diagnosis/tongue/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const data = response.data?.data || response.data || {}
      return {
        imageId: data.imageId || data.id || this.createTempTongueImageId(),
        url: data.url || data.imageUrl || dataUrl,
        dataUrl,
        fileName: data.fileName || file.name,
        mimeType: data.mimeType || file.type,
        size: data.size || file.size,
        uploadedAt: data.uploadedAt || new Date().toISOString()
      }
    } catch (error) {
      console.warn('舌苔上传接口未接通，已切到本地预览模式。', error)
      return {
        imageId: this.createTempTongueImageId(),
        url: dataUrl,
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    }
  }

  /**
   * 舌苔AI分析
   */
  static async analyzeTongueImage(
    imageId: string,
    imageDataUrl: string
  ): Promise<TongueAnalysisResult> {
    if (!imageDataUrl.startsWith('data:image/')) {
      throw new Error('舌象图片数据无效，请重新上传后再试')
    }

    const conversationId = this.createDiagnosisConversationId(imageId)
    const conversationMessages = this.buildDiagnosisConversationSeedMessages()
    const userMessage: MoonshotMessage = {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: imageDataUrl
          }
        },
        {
          type: 'text',
          text: `请分析这张舌象图片，并仅返回一个 JSON 对象，字段如下：
{
  "tongueColor": "pale_red|pale_white|red|crimson|purple|unknown",
  "tongueCoating": "thin_white|thin_yellow|thick_white|thick_yellow|greasy|scarce|none|unknown",
  "moisture": "dry|normal|wet|unknown",
  "bodyShape": "thin|normal|swollen|teeth_marked|cracked|unknown",
  "confidence": 0到1之间的小数,
  "summary": "中文一句话总结"
}
如果无法判断某项，请返回 "unknown"。`
        }
      ]
    }

    const response = await this.postChatCompletion({
      model: API_CONFIG.model,
      messages: [...conversationMessages, userMessage],
      response_format: { type: 'json_object' },
      thinking: { type: 'disabled' },
      max_tokens: 600,
      stream: false
    })

    const analysisContent = response.data?.choices?.[0]?.message?.content

    if (!analysisContent) {
      throw new Error('AI未返回舌象分析结果')
    }

    const analysisResult = this.parseTongueAnalysisResult(analysisContent, imageId)

    this.saveDiagnosisConversation(conversationId, [
      ...conversationMessages,
      this.createTongueAnalysisContextMessage(analysisResult)
    ])

    return {
      ...analysisResult,
      conversationId
    }
  }
  /**
   * 智能中医诊断
   */
  static async diagnose(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    const {
      symptoms,
      pulse,
      tongue,
      tongueImageId,
      tongueImageUrl,
      diagnosisConversationId,
      tongueFeatures,
      patientInfo
    } = request
    const tongueFeatureHint = this.summarizeTongueAnalysis(tongueFeatures)
    const seasonContext = this.buildSeasonContext()

    const userPrompt = `患者信息：
年龄：${patientInfo.age}岁
性别：${patientInfo.gender}
既往病史：${patientInfo.medicalHistory || '无'}
过敏史：${patientInfo.allergies?.join(', ') || '无'}
当前用药：${patientInfo.currentMedications?.join(', ') || '无'}
时令参考：${seasonContext}

症状描述：${symptoms}
脉象：${pulse || '未提供'}
舌象：${tongue || '未提供'}
舌象AI结论：${tongueFeatureHint}

请延续前面的舌象分析上下文，根据中医理论进行详细诊断，并给出：
1. 病因病机
2. 证型
3. 中医诊断结论
4. 治疗建议（请结合当前季节时令）
5. 推荐方向
6. 生活调护建议（请结合当前季节时令）`

    try {
      const conversationId = this.createDiagnosisConversationId(
        diagnosisConversationId || tongueFeatures?.conversationId || tongueImageId || undefined
      )
      const history = this.getDiagnosisConversation(conversationId)
      const userMessage: MoonshotMessage = { role: 'user', content: userPrompt }
      const messages = history.length > 0
        ? [...history, userMessage]
        : [...this.buildDiagnosisConversationSeedMessages(), userMessage]

      const response = await this.postChatCompletion({
        model: API_CONFIG.model,
        messages,
        max_tokens: 2000,
        stream: false
      })

      const diagnosisText = response.data.choices[0]?.message?.content || ''
      this.saveDiagnosisConversation(conversationId, [
        ...messages,
        { role: 'assistant', content: diagnosisText }
      ])
      // 解析AI返回的诊断结果
      return this.parseDiagnosisResult(diagnosisText)
    } catch (error) {
      console.error('诊断失败:', error)
      throw this.formatAIError(error)
    }
  }

  static async diagnoseWithPrescription(request: DiagnosisRequest): Promise<DiagnosisWorkflowResult> {
    const {
      symptoms,
      pulse,
      tongue,
      tongueImageId,
      tongueImageUrl,
      diagnosisConversationId,
      tongueFeatures,
      followUpAnswers,
      patientInfo
    } = request
    const tongueFeatureHint = this.summarizeTongueAnalysis(tongueFeatures)
    const followUpAnswerHint = this.summarizeFollowUpAnswers(followUpAnswers)
    const seasonContext = this.buildSeasonContext()

    const userPrompt = `患者信息：
年龄：${patientInfo.age}岁
性别：${patientInfo.gender}
既往病史：${patientInfo.medicalHistory || '无'}
过敏史：${patientInfo.allergies?.join(', ') || '无'}
当前用药：${patientInfo.currentMedications?.join(', ') || '无'}
时令参考：${seasonContext}

症状描述：${symptoms}
脉象：${pulse || '未提供'}
舌象：${tongue || '未提供'}
舌象AI结论：${tongueFeatureHint}
补充问诊答案：${followUpAnswerHint}

请延续前面的舌象分析上下文，一次性完成综合诊断和处方建议，并仅返回一个 JSON 对象，格式如下：
{
  "diagnosis": {
    "summary": "诊断摘要",
    "diagnosis": "详细病因病机与诊断说明",
    "syndromeType": "证型",
    "treatmentPrinciple": "治则治法",
    "recommendations": ["调护建议1（结合当前季节时令）", "调护建议2（结合当前季节时令）"],
    "confidence": 0到1之间的小数
  },
  "prescription": {
    "summary": "方名或处方摘要",
    "prescription": "完整处方说明",
    "mainHerbs": ["药材1 10g", "药材2 12g"],
    "dosage": "剂量说明",
    "preparation": "煎服方法",
    "precautions": ["注意事项1（结合当前季节时令）", "注意事项2（结合当前季节时令）"],
    "duration": "疗程建议"
  },
  "followUpQuestions": [
    {
      "id": "follow_up_1",
      "category": "睡眠",
      "question": "夜间是否易醒或多梦？",
      "answerType": "select",
      "options": ["无", "偶尔", "经常"],
      "placeholder": "请选择最贴近的情况",
      "rationale": "进一步判断心脾两虚或肝郁化火",
      "required": true
    }
  ]
}
要求：
1. 治疗建议、调护建议、处方注意事项和煎服建议要结合当前季节时令。
2. followUpQuestions 最多返回 4 条。
3. 如果当前信息已经足够，把 followUpQuestions 返回为空数组。
4. 问题必须具体、可回答，不要输出笼统追问。`

    try {
      const conversationId = this.createDiagnosisConversationId(
        diagnosisConversationId || tongueFeatures?.conversationId || tongueImageId || undefined
      )
      const history = this.getDiagnosisConversation(conversationId)
      const userMessage: MoonshotMessage = { role: 'user', content: userPrompt }
      const messages = history.length > 0
        ? [...history, userMessage]
        : [...this.buildDiagnosisConversationSeedMessages(), userMessage]

      const response = await this.postChatCompletion({
        model: API_CONFIG.model,
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 2200,
        stream: false
      })

      const workflowContent = response.data.choices[0]?.message?.content

      if (!workflowContent) {
        throw new Error('AI未返回综合诊断结果')
      }

      this.saveDiagnosisConversation(conversationId, [
        ...messages,
        { role: 'assistant', content: workflowContent }
      ])

      return {
        ...this.parseDiagnosisWorkflowResult(workflowContent),
        conversationId
      }
    } catch (error) {
      console.error('综合诊断失败:', error)
      throw this.formatAIError(error)
    }
  }

  static async streamDiagnoseWithPrescription(
    request: DiagnosisRequest,
    onContent?: (fullText: string, deltaText: string) => void
  ): Promise<DiagnosisWorkflowResult> {
    const {
      symptoms,
      pulse,
      tongue,
      tongueImageId,
      diagnosisConversationId,
      tongueFeatures,
      followUpAnswers,
      patientInfo
    } = request
    const tongueFeatureHint = this.summarizeTongueAnalysis(tongueFeatures)
    const followUpAnswerHint = this.summarizeFollowUpAnswers(followUpAnswers)
    const seasonContext = this.buildSeasonContext()

    const userPrompt = `患者信息：
年龄：${patientInfo.age}岁
性别：${patientInfo.gender}
既往病史：${patientInfo.medicalHistory || '无'}
过敏史：${patientInfo.allergies?.join(', ') || '无'}
当前用药：${patientInfo.currentMedications?.join(', ') || '无'}
时令参考：${seasonContext}

症状描述：${symptoms}
脉象：${pulse || '未提供'}
舌象：${tongue || '未提供'}
舌象AI结论：${tongueFeatureHint}
补充问诊答案：${followUpAnswerHint}

请延续前面的舌象分析上下文，一次性完成综合诊断和处方建议，并严格按以下固定标题输出，标题必须保留：
【诊断摘要】
一句话概括
【证型】
证型名称
【病因病机】
详细说明
【治则】
治则治法
【调护建议】
- 建议1（结合当前季节时令）
- 建议2（结合当前季节时令）
【进一步问诊表】
| 分类 | 问题 | 输入方式 | 可选项 | 占位提示 | 追问目的 |
| 睡眠 | 夜间是否易醒或多梦 | select | 无/偶尔/经常 | 请选择最贴近的情况 | 用于判断心脾两虚或肝郁化火 |
【处方摘要】
方名或摘要
【完整处方】
完整处方说明
【主要药材】
- 药材1 10g
- 药材2 12g
【剂量】
剂量说明
【煎服法】
煎服方法（结合当前季节时令）
【注意事项】
- 注意事项1（结合当前季节时令）
- 注意事项2（结合当前季节时令）
【疗程】
疗程建议
要求：
1. 调护建议、煎服法、注意事项必须结合当前季节时令，但不能脱离当前辨证结论。
2. 进一步问诊表最多输出 4 行。
3. 如果当前信息已经足够，输出一行：| 无 | 当前信息已足够，无需进一步问诊 | text | 无 | 无 | 当前辨证信息已完整 |
4. 输入方式只能是 text、textarea、select。`

    try {
      const conversationId = this.createDiagnosisConversationId(
        diagnosisConversationId || tongueFeatures?.conversationId || tongueImageId || undefined
      )
      const history = this.getDiagnosisConversation(conversationId)
      const userMessage: MoonshotMessage = { role: 'user', content: userPrompt }
      const messages = history.length > 0
        ? [...history, userMessage]
        : [...this.buildDiagnosisConversationSeedMessages(), userMessage]

      const fullText = await this.streamChatCompletion(
        {
          model: API_CONFIG.model,
          messages,
          max_tokens: 2200
        },
        onContent
      )

      if (!fullText.trim()) {
        throw new Error('AI未返回综合诊断结果')
      }

      this.saveDiagnosisConversation(conversationId, [
        ...messages,
        { role: 'assistant', content: fullText }
      ])

      return {
        ...this.parseDiagnosisWorkflowText(fullText),
        conversationId
      }
    } catch (error) {
      console.error('流式综合诊断失败:', error)
      throw this.formatAIError(error)
    }
  }

  /**
   * 智能处方推荐
   */
  static async prescribe(request: PrescriptionRequest): Promise<PrescriptionResponse> {
    const { diagnosis, patientInfo, conversationId: requestConversationId } = request
    const seasonContext = this.buildSeasonContext()

    const userPrompt = `诊断结果：${diagnosis}
患者信息：${JSON.stringify(patientInfo, null, 2)}
时令参考：${seasonContext}

请延续前文病例上下文，推荐合适的中药方剂，包括：
1. 主方推荐（包含具体药材和剂量）
2. 加减变化建议（结合当前季节时令）
3. 煎服方法（结合当前季节时令）
4. 注意事项（结合当前季节时令）
5. 疗程建议`

    try {
      const conversationId = this.createDiagnosisConversationId(
        requestConversationId || this.activeDiagnosisConversationId || undefined
      )
      const history = this.getDiagnosisConversation(conversationId)
      const userMessage: MoonshotMessage = { role: 'user', content: userPrompt }
      const messages = history.length > 0
        ? [...history, userMessage]
        : [...this.buildDiagnosisConversationSeedMessages(), userMessage]

      const response = await this.postChatCompletion({
        model: API_CONFIG.model,
        messages,
        max_tokens: 1500,
        stream: false
      })

      const prescriptionText = response.data.choices[0]?.message?.content || ''
      this.saveDiagnosisConversation(conversationId, [
        ...messages,
        { role: 'assistant', content: prescriptionText }
      ])
      
      return this.parsePrescriptionResult(prescriptionText)
    } catch (error) {
      console.error('处方生成失败:', error)
      throw this.formatAIError(error)
    }
  }

  /**
   * 中医知识问答
   */
  static async askTCM(question: string): Promise<string> {
    const systemPrompt = `你是一位中医知识专家，精通中医理论、诊断、治疗、方剂等各个方面。
请准确、专业地回答用户关于中医的问题，回答要：

1. 基于中医理论
2. 准确可靠
3. 通俗易懂
4. 实用性强

如果问题超出中医范畴，请礼貌地说明。`

    try {
      const response = await this.postChatCompletion({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        stream: false
      })

      return response.data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'
    } catch (error) {
      console.error('知识问答失败:', error)
      throw this.formatAIError(error)
    }
  }

  /**
   * 解析诊断结果
   */
  private static parseDiagnosisResult(text: string): DiagnosisResponse {
    // 这里可以根据AI返回的格式进行更精细的解析
    // 目前采用简单的文本解析方式
    const sections = text.split('\n\n')
    
    return {
      diagnosis: text,
      summary: sections[0] || '中医诊断结果',
      syndromeType: this.extractSyndromeType(text),
      treatmentPrinciple: this.extractTreatmentPrinciple(text),
      recommendations: this.extractRecommendations(text),
      confidence: 0.8, // 可以根据AI的确定性调整
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 解析处方结果
   */
  private static parsePrescriptionResult(text: string): PrescriptionResponse {
    return {
      prescription: text,
      summary: '中药处方推荐',
      mainHerbs: this.extractHerbs(text),
      dosage: this.extractDosage(text),
      preparation: this.extractPreparation(text),
      precautions: this.extractPrecautions(text),
      duration: this.extractDuration(text),
      timestamp: new Date().toISOString()
    }
  }

  // 辅助解析方法
  private static extractSyndromeType(text: string): string {
    const match = text.match(/证型[:：]\s*([^\n]+)/)
    return match && match[1] !== undefined ? match[1].trim() : '需进一步辨证'
  }

  private static extractTreatmentPrinciple(text: string): string {
    const match = text.match(/治则[:：]\s*([^\n]+)/)
    return match && match[1] !== undefined ? match[1].trim() : '辨证施治'
  }

  private static extractRecommendations(text: string): string[] {
    const recommendations: string[] = []
    const lines = text.split('\n')
    let inRecommendations = false
    
    for (const line of lines) {
      if (line.includes('建议') || line.includes('调护')) {
        inRecommendations = true
      }
      if (inRecommendations && line.trim().startsWith('•')) {
        recommendations.push(line.trim().substring(1).trim())
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['注意休息', '饮食调护', '情志调节']
  }

  private static extractHerbs(text: string): string[] {
    const herbs: string[] = []
    const lines = text.split('\n')
    
    for (const line of lines) {
      // 简单的药材提取逻辑，可以根据需要优化
      const matches = line.match(/(\w+[\w\s]*?)[\s]*(\d+[g克])/g)
      if (matches) {
        herbs.push(...matches)
      }
    }
    
    return herbs.length > 0 ? herbs : ['需根据具体情况配伍']
  }

  private static extractDosage(text: string): string {
    const match = text.match(/剂量[:：]\s*([^\n]+)/)
    return match && match[1] ? match[1].trim() : '遵医嘱'
  }

  private static extractPreparation(text: string): string {
    const match = text.match(/煎服法[:：]\s*([^\n]+)/)
    return match && match[1] ? match[1].trim() : '水煎服'
  }

  private static extractPrecautions(text: string): string[] {
    const precautions: string[] = []
    const lines = text.split('\n')
    let inPrecautions = false
    
    for (const line of lines) {
      if (line.includes('注意') || line.includes('禁忌')) {
        inPrecautions = true
      }
      if (inPrecautions && line.trim().startsWith('•')) {
        precautions.push(line.trim().substring(1).trim())
      }
    }
    
    return precautions.length > 0 ? precautions : ['遵医嘱服用', '注意饮食禁忌']
  }

  private static extractDuration(text: string): string {
    const match = text.match(/疗程[:：]\s*([^\n]+)/)
    return match && match[1] ? match[1].trim() : '7-14天'
  }
}

export default TCMService
