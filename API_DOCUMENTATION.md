# 智能中医诊疗系统 - API文档

## 🎯 概述

本文档描述了智能中医诊疗系统的前端API接口规范，包括与后端服务的通信协议、数据格式和错误处理机制。

## 📋 接口规范

### 基础信息
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### 通用响应格式
```typescript
interface ApiResponse<T> {
  code: number      // 状态码
  message: string   // 响应消息
  data: T          // 响应数据
  timestamp: string // 时间戳
}
```

### 分页响应格式
```typescript
interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    items: T[]      // 数据列表
    total: number   // 总记录数
    page: number    // 当前页码
    size: number    // 每页大小
    pages: number   // 总页数
  }
  timestamp: string
}
```

## 🔐 认证接口

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123456",
      "username": "doctor_zhang",
      "name": "张医生",
      "role": "doctor",
      "avatar": "https://example.com/avatar.jpg"
    },
    "expiresIn": 86400
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### 刷新Token
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

## 👤 用户管理接口

### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer {token}
```

### 更新用户信息
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string"
}
```

### 修改密码
```http
PUT /api/user/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "string",
  "newPassword": "string"
}
```

## 🏥 诊断接口

### 开始诊断
```http
POST /api/diagnosis/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientInfo": {
    "name": "患者姓名",
    "age": 35,
    "gender": "male",
    "medicalHistory": ["高血压", "糖尿病"],
    "allergies": ["青霉素"]
  },
  "symptoms": {
    "mainSymptoms": ["头痛", "发热"],
    "symptomDetails": "头痛剧烈，伴有恶心呕吐",
    "accompanyingSymptoms": ["咳嗽", "咽痛"],
    "triggeringFactors": "受凉后加重"
  },
  "fourDiagnostics": {
    "inspection": {
      "complexion": "红润",
      "tongueColor": "淡红",
      "tongueCoating": "薄白"
    },
    "auscultation": {
      "voice": "正常",
      "breathing": "平稳"
    },
    "inquiry": {
      "diet": "食欲不振",
      "sleep": "失眠多梦",
      "bowel": "便秘",
      "urine": "正常"
    },
    "palpation": {
      "pulse": "弦数",
      "abdomen": "正常"
    }
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "诊断开始",
  "data": {
    "diagnosisId": "diag_123456",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

### 获取诊断结果
```http
GET /api/diagnosis/{diagnosisId}/result
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "诊断完成",
  "data": {
    "diagnosisId": "diag_123456",
    "status": "completed",
    "result": {
      "syndromeType": "肝阳上亢证",
      "etiology": "情志内伤，肝郁化火",
      "pathogenesis": "肝阳上亢，上扰清空",
      "diseaseLocation": "肝、头部",
      "diseaseNature": "实证、热证",
      "diagnosisBasis": [
        "头痛剧烈，伴有恶心呕吐",
        "舌质红，苔黄腻",
        "脉象弦数"
      ],
      "confidence": 0.85
    },
    "prescription": {
      "name": "天麻钩藤饮加减",
      "ingredients": [
        {
          "name": "天麻",
          "dosage": "10g",
          "function": "平肝息风"
        },
        {
          "name": "钩藤",
          "dosage": "15g",
          "function": "清热平肝"
        }
      ],
      "usage": "水煎服，每日1剂，分2次服用",
      "duration": "7天",
      "precautions": ["忌辛辣食物", "避免情绪激动"]
    },
    "treatmentPlan": {
      "lifestyle": {
        "diet": "清淡饮食，多食蔬菜水果",
        "dailyRoutine": "规律作息，避免熬夜",
        "emotional": "保持心情舒畅，避免情绪激动"
      },
      "prognosis": {
        "condition": "良好",
        "followUp": "1周后复诊",
        "notes": "注意休息，避免劳累"
      }
    }
  }
}
```

### 保存诊断记录
```http
POST /api/diagnosis/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "diagnosisId": "diag_123456",
  "patientInfo": { /* 患者信息 */ },
  "diagnosisResult": { /* 诊断结果 */ },
  "prescription": { /* 处方信息 */ },
  "treatmentPlan": { /* 治疗方案 */ }
}
```

## 📋 病历管理接口

### 获取病历列表
```http
GET /api/records?page=1&size=10&keyword=张三&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `size`: 每页大小 (默认: 10)
- `keyword`: 搜索关键词 (可选)
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)
- `diagnosis`: 诊断结果筛选 (可选)

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "record_123",
        "diagnosisId": "diag_123456",
        "patientName": "张三",
        "patientAge": 35,
        "patientGender": "男",
        "diagnosisDate": "2024-01-15T14:30:00.000Z",
        "mainSymptoms": ["头痛", "发热"],
        "diagnosis": "肝阳上亢证",
        "prescription": "天麻钩藤饮加减",
        "status": "active",
        "createdAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "size": 10,
    "pages": 15
  }
}
```

### 获取病历详情
```http
GET /api/records/{recordId}
Authorization: Bearer {token}
```

### 更新病历
```http
PUT /api/records/{recordId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientInfo": { /* 患者信息 */ },
  "diagnosisResult": { /* 诊断结果 */ },
  "prescription": { /* 处方信息 */ },
  "treatmentPlan": { /* 治疗方案 */ }
}
```

### 删除病历
```http
DELETE /api/records/{recordId}
Authorization: Bearer {token}
```

### 导出病历
```http
GET /api/records/export?format=pdf&recordIds=record_123,record_456
Authorization: Bearer {token}
```

**查询参数**:
- `format`: 导出格式 (pdf/xlsx)
- `recordIds`: 病历ID列表 (逗号分隔)

## 📚 知识库接口

### 获取知识库列表
```http
GET /api/knowledge?page=1&size=10&category=herbs&keyword=人参
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `size`: 每页大小 (默认: 10)
- `category`: 分类筛选 (可选)
- `keyword`: 搜索关键词 (可选)
- `tags`: 标签筛选 (可选)

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "knowledge_123",
        "title": "人参的功效与应用",
        "category": "herbs",
        "categoryName": "中药材",
        "description": "人参为五加科植物，具有大补元气、复脉固脱等功效...",
        "content": "详细内容...",
        "tags": ["补气药", "名贵药材"],
        "author": "李时珍",
        "views": 1250,
        "likes": 89,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 500,
    "page": 1,
    "size": 10,
    "pages": 50
  }
}
```

### 获取知识详情
```http
GET /api/knowledge/{knowledgeId}
Authorization: Bearer {token}
```

### 搜索知识
```http
POST /api/knowledge/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "keyword": "人参",
  "category": "herbs",
  "tags": ["补气药"],
  "filters": {
    "author": "李时珍",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }
}
```

### 获取热门知识
```http
GET /api/knowledge/hot?limit=10&category=herbs
Authorization: Bearer {token}
```

### 收藏知识
```http
POST /api/knowledge/{knowledgeId}/favorite
Authorization: Bearer {token}
```

### 取消收藏
```http
DELETE /api/knowledge/{knowledgeId}/favorite
Authorization: Bearer {token}
```

### 获取收藏列表
```http
GET /api/knowledge/favorites?page=1&size=10
Authorization: Bearer {token}
```

## 📊 统计分析接口

### 获取诊断统计
```http
GET /api/statistics/diagnosis?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalDiagnoses": 1200,
    "todayDiagnoses": 15,
    "thisWeekDiagnoses": 89,
    "thisMonthDiagnoses": 356,
    "syndromeDistribution": [
      { "syndrome": "肝阳上亢证", "count": 156, "percentage": 13.0 },
      { "syndrome": "脾虚湿盛证", "count": 134, "percentage": 11.2 }
    ],
    "trend": [
      { "date": "2024-01-01", "count": 12 },
      { "date": "2024-01-02", "count": 18 }
    ]
  }
}
```

### 获取知识库统计
```http
GET /api/statistics/knowledge
Authorization: Bearer {token}
```

### 获取用户活跃度
```http
GET /api/statistics/user-activity
Authorization: Bearer {token}
```

## ⚠️ 错误处理

### 错误响应格式
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 状态码说明
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率限制 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 业务错误码
```typescript
enum BusinessErrorCode {
  // 认证相关
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  TOKEN_INVALID = 1003,
  
  // 诊断相关
  DIAGNOSIS_NOT_FOUND = 2001,
  DIAGNOSIS_PROCESSING = 2002,
  INVALID_SYMPTOM_DATA = 2003,
  
  // 病历相关
  RECORD_NOT_FOUND = 3001,
  RECORD_ACCESS_DENIED = 3002,
  
  // 知识库相关
  KNOWLEDGE_NOT_FOUND = 4001,
  INVALID_CATEGORY = 4002,
  
  // 系统相关
  RATE_LIMIT_EXCEEDED = 5001,
  SERVICE_UNAVAILABLE = 5002
}
```

## 🔧 开发工具

### API测试工具
- **Postman**: API接口测试
- **curl**: 命令行测试
- **浏览器开发者工具**: 网络请求监控

### 调试工具
```typescript
// 请求拦截器调试
axios.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})

// 响应拦截器调试
axios.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})
```

## 📋 版本历史

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础诊断功能
- 病历管理功能
- 知识库功能

### v1.1.0 (2024-02-01)
- 新增统计分析功能
- 优化搜索算法
- 改进用户界面

---

**传承千年中医智慧，融合现代科技力量** 🌿✨