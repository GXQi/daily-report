<template>
  <div class="container">
    <header class="header">
      <h1>🤖 AI 日报</h1>
      <p class="date" v-if="report">{{ report.date }}</p>
    </header>

    <!-- 加载状态 -->
    <div class="loading" v-if="loading">正在加载今日日报...</div>

    <!-- 空状态 -->
    <div class="empty" v-else-if="!report">
      <p>今日日报尚未生成，请稍后访问</p>
    </div>

    <!-- 日报内容 -->
    <template v-else>
      <!-- 今日概览 -->
      <section class="overview">
        <h2>📋 今日概览</h2>
        <p>{{ report.overview }}</p>
      </section>

      <!-- 分类资讯 -->
      <section
        v-for="category in report.categories"
        :key="category.name"
        class="category"
      >
        <h2>{{ categoryIcon(category.name) }} {{ category.name }}</h2>
        <div class="news-list">
          <article
            v-for="item in category.items"
            :key="item.link"
            class="news-item"
          >
            <h3>
              <a :href="item.link" target="_blank" rel="noopener">
                {{ item.title }}
              </a>
            </h3>
            <p class="summary">{{ item.summary }}</p>
            <span class="source">{{ item.source }}</span>
          </article>
        </div>
      </section>
    </template>

    <footer class="footer">
      <p>由 RSS 聚合 + DeepSeek 自动生成 · 每日 9:30 更新</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const report = ref(null);
const loading = ref(true);

// 分类对应的图标
const iconMap = {
  '大模型动态': '🧠',
  '开源项目': '📦',
  'AI 应用': '💡',
  '学术论文': '📄',
  '行业动态': '📈',
  '技术教程': '🛠️'
};

function categoryIcon(name) {
  return iconMap[name] || '📌';
}

onMounted(async () => {
  try {
    // 加时间戳防止浏览器缓存
    const res = await fetch(`./data/latest.json?t=${Date.now()}`);
    if (res.ok) {
      report.value = await res.json();
    }
  } catch (e) {
    console.warn('加载日报数据失败', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
}

.date {
  color: #888;
  margin-top: 4px;
  font-size: 15px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 16px;
}

.overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
}

.overview h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.overview p {
  font-size: 15px;
  line-height: 1.8;
  opacity: 0.95;
}

.category {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.category h2 {
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.news-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.news-item h3 a {
  color: #1a1a1a;
  text-decoration: none;
}

.news-item h3 a:hover {
  color: #667eea;
}

.summary {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 4px;
}

.source {
  font-size: 12px;
  color: #aaa;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.footer {
  text-align: center;
  padding: 32px 0 16px;
  color: #bbb;
  font-size: 13px;
}
</style>
