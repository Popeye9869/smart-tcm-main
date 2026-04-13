# 智能中医诊疗系统 - 部署指南

## 🚀 部署概述

本文档提供了智能中医诊疗系统的完整部署指南，包括开发环境、测试环境和生产环境的部署流程。

## 📋 前置要求

### 系统要求
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Node.js**: 20.19.0 或 >=22.12.0
- **内存**: 最少 4GB RAM
- **存储**: 最少 10GB 可用空间
- **网络**: 稳定的互联网连接

### 技术栈
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **HTTP客户端**: Axios
- **国际化**: Vue I18n

## 🔧 开发环境部署

### 1. 环境准备
```bash
# 安装Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20.19.0
nvm use 20.19.0

# 验证安装
node --version  # v20.19.0
npm --version   # 10.x.x
```

### 2. 项目克隆与依赖安装
```bash
# 克隆项目
git clone https://github.com/your-org/smart-tcm.git
cd smart-tcm

# 安装依赖
npm install

# 安装开发依赖
npm install --save-dev
```

### 3. 环境配置
```bash
# 创建环境配置文件
cp .env.example .env.development
```

编辑 `.env.development` 文件：
```env
# 基础配置
VITE_APP_TITLE=智能中医诊疗系统
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# AI服务配置
VITE_AI_API_KEY=your-development-ai-api-key
VITE_AI_API_BASE_URL=https://api.openai.com
VITE_AI_MODEL=gpt-4

# 其他配置
VITE_ENABLE_MOCK=true
VITE_ENABLE_DEBUG=true
```

### 4. 开发服务器启动
```bash
# 启动开发服务器
npm run dev

# 或使用指定端口
npm run dev -- --port 8080
```

访问地址: `http://localhost:5173`

## 🧪 测试环境部署

### 1. 测试环境配置
```bash
# 创建测试环境配置
cp .env.example .env.test
```

编辑 `.env.test` 文件：
```env
# 基础配置
VITE_APP_TITLE=智能中医诊疗系统 - 测试环境
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=test

# API配置
VITE_API_BASE_URL=https://api-test.smart-tcm.com
VITE_API_TIMEOUT=30000

# AI服务配置
VITE_AI_API_KEY=your-test-ai-api-key
VITE_AI_API_BASE_URL=https://api.openai.com
VITE_AI_MODEL=gpt-4

# 其他配置
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=true
```

### 2. 构建测试版本
```bash
# 构建测试版本
npm run build:test

# 构建输出目录
dist/
├── assets/
├── favicon.ico
├── index.html
└── ...
```

### 3. 测试环境部署
```bash
# 安装Nginx (Ubuntu)
sudo apt update
sudo apt install nginx

# 配置Nginx
sudo nano /etc/nginx/sites-available/smart-tcm-test
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name test.smart-tcm.com;
    
    root /var/www/smart-tcm-test;
    index index.html;
    
    # 启用Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass https://api-test.smart-tcm.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4. 启用站点
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/smart-tcm-test /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 🚀 生产环境部署

### 1. 生产环境配置
```bash
# 创建生产环境配置
cp .env.example .env.production
```

编辑 `.env.production` 文件：
```env
# 基础配置
VITE_APP_TITLE=智能中医诊疗系统
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# API配置
VITE_API_BASE_URL=https://api.smart-tcm.com
VITE_API_TIMEOUT=30000

# AI服务配置
VITE_AI_API_KEY=your-production-ai-api-key
VITE_AI_API_BASE_URL=https://api.openai.com
VITE_AI_MODEL=gpt-4

# 性能优化
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# 安全配置
VITE_ENABLE_SECURITY_HEADERS=true
```

### 2. 优化构建配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    // 生产环境启用包分析
    process.env.NODE_ENV === 'production' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils-vendor': ['axios', 'dayjs'],
          'animation-vendor': ['@vueuse/motion']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  // 生产环境优化
  base: './',
  server: {
    port: 5173,
    host: true
  }
})
```

### 3. 生产环境构建
```bash
# 安装依赖
npm ci --only=production

# 构建生产版本
npm run build

# 验证构建结果
npm run preview
```

### 4. 服务器配置

#### 系统优化
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install nginx nodejs npm git -y

# 创建部署用户
sudo useradd -m -s /bin/bash smarttcm
sudo usermod -aG sudo smarttcm
```

#### 目录结构
```bash
# 创建项目目录
sudo mkdir -p /var/www/smart-tcm
sudo chown -R smarttcm:smarttcm /var/www/smart-tcm

# 创建日志目录
sudo mkdir -p /var/log/smart-tcm
sudo chown -R smarttcm:smarttcm /var/log/smart-tcm
```

#### Nginx生产配置
```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/smart-tcm
```

生产环境Nginx配置：
```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name smart-tcm.com www.smart-tcm.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name smart-tcm.com www.smart-tcm.com;
    
    # SSL证书配置
    ssl_certificate /etc/ssl/certs/smart-tcm.com.crt;
    ssl_certificate_key /etc/ssl/private/smart-tcm.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 安全头配置
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # 根目录配置
    root /var/www/smart-tcm;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        access_log off;
    }
    
    # HTML文件缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API代理
    location /api/ {
        proxy_pass https://api.smart-tcm.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲区设置
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5. 自动化部署脚本

创建部署脚本 `/var/www/smart-tcm/deploy.sh`：
```bash
#!/bin/bash

# 部署配置
PROJECT_DIR="/var/www/smart-tcm"
BACKUP_DIR="/var/backups/smart-tcm"
LOG_FILE="/var/log/smart-tcm/deploy.log"
DATE=$(date +"%Y%m%d_%H%M%S")

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# 错误处理
error_exit() {
    log "ERROR: $1"
    exit 1
}

# 开始部署
log "Starting deployment..."

cd $PROJECT_DIR || error_exit "Failed to change to project directory"

# 备份当前版本
log "Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C $PROJECT_DIR . || log "Backup failed"

# 拉取最新代码
log "Pulling latest code..."
git pull origin main || error_exit "Failed to pull latest code"

# 安装依赖
log "Installing dependencies..."
npm ci --only=production || error_exit "Failed to install dependencies"

# 构建项目
log "Building project..."
npm run build || error_exit "Build failed"

# 复制构建文件
log "Copying build files..."
cp -r dist/* $PROJECT_DIR/ || error_exit "Failed to copy build files"

# 重启Nginx
log "Restarting Nginx..."
sudo systemctl reload nginx || error_exit "Failed to restart Nginx"

# 清理旧备份 (保留最近10个)
log "Cleaning old backups..."
cd $BACKUP_DIR && ls -t backup_*.tar.gz | tail -n +11 | xargs rm -f

log "Deployment completed successfully!"
```

设置脚本权限：
```bash
chmod +x /var/www/smart-tcm/deploy.sh
```

### 6. 监控与日志

#### 日志配置
```bash
# 创建日志配置
sudo nano /etc/logrotate.d/smart-tcm
```

日志轮转配置：
```
/var/log/smart-tcm/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 smarttcm smarttcm
    postrotate
        systemctl reload nginx
    endscript
}
```

#### 监控脚本
创建监控脚本 `/var/www/smart-tcm/monitor.sh`：
```bash
#!/bin/bash

# 监控配置
WEBSITE_URL="https://smart-tcm.com"
LOG_FILE="/var/log/smart-tcm/monitor.log"
ALERT_EMAIL="admin@smart-tcm.com"

# 检查网站状态
response=$(curl -s -o /dev/null -w "%{http_code}" $WEBSITE_URL)

if [ $response -eq 200 ]; then
    echo "[$(date)] Website is UP - HTTP $response" >> $LOG_FILE
else
    echo "[$(date)] Website is DOWN - HTTP $response" >> $LOG_FILE
    # 发送告警邮件
    echo "Website $WEBSITE_URL is down! HTTP $response" | mail -s "Website Alert" $ALERT_EMAIL
fi

# 检查磁盘空间
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo "[$(date)] WARNING: Disk usage is ${disk_usage}%" >> $LOG_FILE
fi

# 检查内存使用
memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ $memory_usage -gt 80 ]; then
    echo "[$(date)] WARNING: Memory usage is ${memory_usage}%" >> $LOG_FILE
fi
```

设置定时任务：
```bash
# 添加定时任务
crontab -e

# 每5分钟检查一次
*/5 * * * * /var/www/smart-tcm/monitor.sh

# 每天凌晨2点备份
0 2 * * * /var/www/smart-tcm/backup.sh
```

## 🔒 安全加固

### 1. 系统安全
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 安装Fail2ban
sudo apt install fail2ban -y
```

### 2. SSL证书配置
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d smart-tcm.com -d www.smart-tcm.com

# 设置自动续期
sudo crontab -e
# 添加: 0 2 * * * certbot renew --quiet
```

### 3. 应用安全
```bash
# 设置文件权限
sudo chown -R www-data:www-data /var/www/smart-tcm
sudo chmod -R 755 /var/www/smart-tcm
sudo chmod -R 644 /var/www/smart-tcm/*.html
sudo chmod -R 755 /var/www/smart-tcm/deploy.sh
```

## 📊 性能监控

### 1. 前端性能监控
在 `main.ts` 中添加性能监控：
```typescript
// 性能监控
if (import.meta.env.PROD) {
  // 页面加载时间监控
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    console.log(`Page load time: ${loadTime}ms`)
    
    // 发送到监控服务
    navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
      loadTime,
      timestamp: Date.now()
    }))
  })
  
  // 资源加载错误监控
  window.addEventListener('error', (event) => {
    console.error('Resource loading error:', event.error)
  })
}
```

### 2. 服务器监控
安装和配置监控工具：
```bash
# 安装Node.js进程监控器
npm install -g pm2

# 创建PM2配置文件
echo 'module.exports = {
  apps: [{
    name: "smart-tcm-monitor",
    script: "monitor.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}' > ecosystem.config.js

# 启动监控
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 回滚策略

### 快速回滚脚本
创建回滚脚本 `/var/www/smart-tcm/rollback.sh`：
```bash
#!/bin/bash

# 回滚配置
BACKUP_DIR="/var/backups/smart-tcm"
PROJECT_DIR="/var/www/smart-tcm"
LOG_FILE="/var/log/smart-tcm/rollback.log"

# 获取最新的备份
LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.tar.gz | head -n1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found!" >> $LOG_FILE
    exit 1
fi

echo "Rolling back to: $LATEST_BACKUP" >> $LOG_FILE

# 停止Nginx
sudo systemctl stop nginx

# 恢复备份
cd $PROJECT_DIR
sudo rm -rf *
sudo tar -xzf $LATEST_BACKUP -C $PROJECT_DIR

# 重启Nginx
sudo systemctl start nginx

echo "Rollback completed!" >> $LOG_FILE
```

设置执行权限：
```bash
chmod +x /var/www/smart-tcm/rollback.sh
```

## 📞 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version
```

#### 2. Nginx配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 3. 权限问题
```bash
# 修复文件权限
sudo chown -R www-data:www-data /var/www/smart-tcm
sudo chmod -R 755 /var/www/smart-tcm
```

#### 4. SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 重新安装证书
sudo certbot --nginx -d smart-tcm.com -d www.smart-tcm.com
```

## 📚 相关资源

### 官方文档
- [Vue.js 部署指南](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/docs/)

### 监控工具
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [Pingdom](https://www.pingdom.com/)

---

**传承千年中医智慧，融合现代科技力量** 🌿✨