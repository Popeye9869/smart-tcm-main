<template>
  <footer class="app-footer" :class="{ 'dark': appStore.isDarkMode }">
    <div class="footer-content">
      <!-- 左侧信息 -->
      <div class="footer-left">
        <div class="footer-brand">
          <el-icon size="24" color="var(--tcm-primary)">
            <MostlyCloudy />
          </el-icon>
          <div class="brand-info">
            <h3 class="brand-title">智能中医诊疗系统</h3>
            <p class="brand-desc">传承千年中医智慧，融合现代科技力量</p>
          </div>
        </div>
        
        <div class="footer-links">
          <router-link to="/about" class="footer-link">关于我们</router-link>
          <router-link to="/contact" class="footer-link">联系我们</router-link>
          <router-link to="/privacy" class="footer-link">隐私政策</router-link>
          <router-link to="/terms" class="footer-link">服务条款</router-link>
        </div>
      </div>
      
      <!-- 中间功能 -->
      <div class="footer-center">
        <div class="feature-grid">
          <div class="feature-item">
            <el-icon size="20" color="var(--tcm-success)">
              <CircleCheck />
            </el-icon>
            <span>智能诊断</span>
          </div>
          <div class="feature-item">
            <el-icon size="20" color="var(--tcm-warning)">
              <MagicStick />
            </el-icon>
            <span>个性化处方</span>
          </div>
          <div class="feature-item">
            <el-icon size="20" color="var(--tcm-primary)">
              <Collection />
            </el-icon>
            <span>知识库</span>
          </div>
          <div class="feature-item">
            <el-icon size="20" color="var(--tcm-secondary)">
              <TrendCharts />
            </el-icon>
            <span>健康管理</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧联系 -->
      <div class="footer-right">
        <div class="contact-info">
          <h4 class="contact-title">联系我们</h4>
          <div class="contact-item">
            <el-icon size="16">
              <Phone />
            </el-icon>
            <span>400-123-4567</span>
          </div>
          <div class="contact-item">
            <el-icon size="16">
              <Message />
            </el-icon>
            <span>support@smarttcm.com</span>
          </div>
          <div class="contact-item">
            <el-icon size="16">
              <Location />
            </el-icon>
            <span>北京市朝阳区中医大厦</span>
          </div>
        </div>
        
        <div class="social-links">
          <el-button circle size="small" class="social-btn">
            <el-icon size="16">
              <Platform />
            </el-icon>
          </el-button>
          <el-button circle size="small" class="social-btn">
            <el-icon size="16">
              <ChatDotRound />
            </el-icon>
          </el-button>
          <el-button circle size="small" class="social-btn">
            <el-icon size="16">
              <Share />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 底部版权 -->
    <div class="footer-bottom">
      <div class="copyright">
        <p>&copy; 2024 智能中医诊疗系统. All rights reserved.</p>
        <p>京ICP备12345678号-1 | 京公网安备11010502012345号</p>
      </div>
      
      <div class="tech-info">
        <span>Powered by AI Technology</span>
        <el-divider direction="vertical" />
        <span>Version 1.0.0</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  MostlyCloudy,
  CircleCheck,
  MagicStick,
  Collection,
  TrendCharts,
  Phone,
  Message,
  Location,
  Platform,
  ChatDotRound,
  Share
} from '@element-plus/icons-vue'

const appStore = useAppStore()
</script>

<style scoped>
.app-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  margin-top: auto;
  transition: all 0.3s ease;
}

.app-footer.dark {
  background: rgba(30, 30, 30, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 48px;
  padding: 48px 24px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-info {
  flex: 1;
}

.brand-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--tcm-primary);
  margin: 0 0 4px 0;
}

.brand-desc {
  font-size: 0.9rem;
  color: var(--tcm-secondary);
  margin: 0;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-link {
  color: var(--tcm-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--tcm-primary);
}

.footer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(245, 230, 211, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(139, 69, 19, 0.1);
  transform: translateY(-2px);
}

.feature-item span {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--tcm-dark);
}

.footer-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--tcm-secondary);
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  max-width: 1400px;
  margin: 0 auto;
}

.copyright {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.copyright p {
  font-size: 0.8rem;
  color: var(--tcm-secondary);
  margin: 0;
}

.tech-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--tcm-secondary);
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }
  
  .footer-brand {
    justify-content: center;
  }
  
  .footer-links {
    justify-content: center;
  }
  
  .feature-grid {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .contact-info {
    align-items: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media screen and (max-width: 768px) {
  .footer-content {
    padding: 32px 16px 16px;
    gap: 24px;
  }
  
  .footer-bottom {
    padding: 16px;
  }
}

@media screen and (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>