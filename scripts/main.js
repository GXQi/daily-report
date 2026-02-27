import { fetchAllFeeds } from './fetch-rss.js';
import { generateSummary } from './summarize.js';
import { pushToFeishu } from './push-feishu.js';
import { writeReportData } from './generate-data.js';

async function main() {
  console.log('=== AI 日报生成开始 ===\n');

  // 1. 抓取 RSS
  console.log('📡 正在抓取 RSS 源...');
  const articles = await fetchAllFeeds();

  if (articles.length === 0) {
    console.log('今天没有抓取到文章，生成空报告');
    const emptyReport = {
      date: new Date().toISOString().slice(0, 10),
      overview: '今日暂无新资讯',
      categories: []
    };
    writeReportData(emptyReport);
    return;
  }

  // 2. 调用 DeepSeek 生成摘要
  console.log('\n🤖 正在调用 DeepSeek 生成摘要...');
  const report = await generateSummary(articles);

  // 3. 推送到飞书
  console.log('\n📮 正在推送到飞书...');
  await pushToFeishu(report);

  // 4. 生成前端数据
  console.log('\n📝 正在生成前端数据...');
  writeReportData(report);

  console.log('\n=== AI 日报生成完成 ===');
}

main().catch((err) => {
  console.error('执行失败:', err);
  process.exit(1);
});
