<template>
  <div class="about-view">
    <div class="page-header">
      <h1 class="page-title">关于智能中医诊疗系统</h1>
      <p class="page-subtitle">传承千年中医智慧，融合现代科技力量</p>
    </div>

    <div class="about-content">
      <div class="section intro-section">
        <div class="section-header">
          <h2>系统介绍</h2>
        </div>
        <div class="section-content">
          <p>
            智能中医诊疗系统是一款基于人工智能技术的中医辅助诊疗平台。系统深度融合传统中医理论
            与现代AI技术，通过大数据分析和机器学习算法，为用户提供个性化的中医诊疗服务。
          </p>
          <p>
            我们致力于传承和发展中医药文化，让古老的中医智慧在现代科技的助力下焕发新的生机，
            为更多人的健康保驾护航。
          </p>
        </div>
      </div>

      <div class="section features-section">
        <div class="section-header">
          <h2>核心功能</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <MostlyCloudy />
              </el-icon>
            </div>
            <h3>智能诊断</h3>
            <p>基于中医四诊理论，结合AI算法进行症状分析和证型判断</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <DocumentCopy />
              </el-icon>
            </div>
            <h3>个性化处方</h3>
            <p>根据诊断结果，智能推荐个性化的中药处方和治疗方案</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <Reading />
              </el-icon>
            </div>
            <h3>知识库</h3>
            <p>丰富的中医药知识库，包含中药材、方剂、诊断方法等内容</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <TrendCharts />
              </el-icon>
            </div>
            <h3>病历管理</h3>
            <p>完整的病历记录和管理系统，支持历史记录查询和分析</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <User />
              </el-icon>
            </div>
            <h3>个人中心</h3>
            <p>个人健康档案管理，支持体质辨识和健康建议</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48" color="var(--tcm-primary)">
                <MagicStick />
              </el-icon>
            </div>
            <h3>生活调护</h3>
            <p>提供饮食、起居、运动等全方位的生活调护建议</p>
          </div>
        </div>
      </div>

      <div class="section tech-section">
        <div class="section-header">
          <h2>技术特色</h2>
        </div>
        <div class="tech-content">
          <div class="tech-item">
            <h4>🤖 AI智能算法</h4>
            <p>采用深度学习和自然语言处理技术，准确理解症状描述</p>
          </div>
          <div class="tech-item">
            <h4>📚 大数据分析</h4>
            <p>基于海量中医古籍和现代临床数据，提供科学依据</p>
          </div>
          <div class="tech-item">
            <h4>🔒 隐私保护</h4>
            <p>严格的数据加密和隐私保护措施，确保用户信息安全</p>
          </div>
          <div class="tech-item">
            <h4>📱 多端适配</h4>
            <p>响应式设计，支持PC、平板、手机等多种设备访问</p>
          </div>
        </div>
      </div>

      <div class="section team-section">
        <div class="section-header">
          <h2>开发团队</h2>
        </div>
        <div class="team-content">
          <p>
            智能中医诊疗系统由一支热爱中医药文化的专业技术团队精心打造。
            团队成员包括中医专家、软件工程师、AI算法工程师等，致力于将传统中医智慧与现代科技完美结合。
          </p>
          <p>
            我们秉承"传承、创新、精准、便民"的理念，不断优化系统功能，
            为用户提供更加专业、便捷的中医诊疗服务。
          </p>
        </div>
      </div>

      <div class="section contact-section">
        <div class="section-header">
          <h2>联系我们</h2>
        </div>
        <div class="contact-content">
          <div class="contact-info">
            <p><strong>技术支持：</strong>support@smarttcm.com</p>
            <p><strong>业务合作：</strong>business@smarttcm.com</p>
            <p><strong>意见反馈：</strong>feedback@smarttcm.com</p>
          </div>
          <div class="contact-actions">
            <el-button type="primary" size="large">
              <el-icon><Message /></el-icon>
              发送邮件
            </el-button>
            <el-button size="large">
              <el-icon><Phone /></el-icon>
              电话咨询
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MostlyCloudy, DocumentCopy, Reading, TrendCharts, User, MagicStick, Message, Phone } from '@element-plus/icons-vue'
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 100%);
  padding: 40px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 64px;
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

.about-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0;
}

.section-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--tcm-secondary);
  margin-bottom: 24px;
}

.section-content p:last-child {
  margin-bottom: 0;
}

/* 功能特色 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 16px 0;
}

.feature-card p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--tcm-secondary);
  margin: 0;
}

/* 技术特色 */
.tech-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.tech-item {
  padding: 24px;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 12px;
}

.tech-item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--tcm-primary);
  margin: 0 0 12px 0;
}

.tech-item p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--tcm-secondary);
  margin: 0;
}

/* 团队介绍 */
.team-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--tcm-secondary);
  margin-bottom: 24px;
}

/* 联系我们 */
.contact-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 48px;
}

.contact-info p {
  font-size: 1.1rem;
  color: var(--tcm-secondary);
  margin-bottom: 16px;
}

.contact-actions {
  display: flex;
  gap: 16px;
}

.contact-actions .el-button {
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .section {
    padding: 32px;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
}

@media screen and (max-width: 768px) {
  .about-view {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .section {
    padding: 24px;
  }
  
  .section-header {
    margin-bottom: 32px;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-content {
    grid-template-columns: 1fr;
  }
  
  .contact-content {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-actions {
    justify-content: center;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .section {
    padding: 20px;
  }
  
  .feature-card {
    padding: 24px 16px;
  }
  
  .contact-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-actions .el-button {
    width: 200px;
  }
}
</style>
