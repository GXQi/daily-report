import Parser from 'rss-parser';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'AI-Daily-Bot/1.0' }
});

/**
 * 抓取所有 RSS 源，过滤最近 24 小时的文章
 * @returns {Promise<Array>} 文章列表
 */
export async function fetchAllFeeds() {
  const sourcesPath = join(__dirname, '..', 'rss-sources.json');
  const sources = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const results = [];

  // 并行抓取所有源
  const tasks = sources.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items
        .filter((item) => {
          // 有发布时间的按时间过滤，没有的默认保留（ArXiv 等源日期格式特殊）
          if (item.pubDate) {
            return new Date(item.pubDate).getTime() > oneDayAgo;
          }
          return true;
        })
        .slice(0, 10) // 每个源最多 10 条，控制 token 消耗
        .map((item) => ({
          title: item.title?.trim() || '',
          link: item.link || '',
          summary: (item.contentSnippet || item.content || '').slice(0, 500).trim(),
          source: source.name,
          categoryHint: source.categoryHint,
          pubDate: item.pubDate || ''
        }));

      return items;
    } catch (err) {
      // 单个源失败不影响整体流程
      console.warn(`抓取 ${source.name} 失败: ${err.message}`);
      return [];
    }
  });

  const allItems = await Promise.all(tasks);
  for (const items of allItems) {
    results.push(...items);
  }

  // 按标题去重
  const seen = new Set();
  const unique = results.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });

  console.log(`共抓取到 ${unique.length} 篇文章（去重后）`);
  return unique;
}
