import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

const SYSTEM_PROMPT = `你是一个 AI 领域资讯编辑。你的任务是将一批 AI 相关新闻整理成一份结构清晰的日报。

要求：
1. 将资讯分为以下类别（没有内容的类别直接省略）：
   - 大模型动态：大模型发布、更新、评测相关
   - 开源项目：开源工具、框架、模型发布
   - AI 应用：AI 在各行业的落地应用
   - 学术论文：重要论文、研究突破
   - 行业动态：融资、政策、公司战略、人事变动
   - 技术教程：教程、最佳实践、技术解析

2. 每条资讯给出：
   - 一句话标题（精炼原标题）
   - 2-3 句摘要（提取核心信息）
   - 原文链接

3. 每个类别最多保留 5 条最有价值的资讯
4. 在日报开头写一段 3-4 句的"今日概览"，总结今天最值得关注的 2-3 件事
5. 输出格式为 JSON`;

/**
 * 调用 DeepSeek 生成分类摘要日报
 * @param {Array} articles 原始文章列表
 * @returns {Promise<Object>} 结构化日报 JSON
 */
export async function generateSummary(articles) {
  // 控制输入量，最多 40 篇
  const batch = articles.slice(0, 40);
  const today = new Date().toISOString().slice(0, 10);

  const userPrompt = `以下是今天（${today}）抓取到的 ${batch.length} 条 AI 资讯原始数据，请整理成日报。

${JSON.stringify(batch, null, 2)}

请严格按以下 JSON 格式输出：
{
  "date": "${today}",
  "overview": "今日概览文本",
  "categories": [
    {
      "name": "类别名",
      "items": [
        {
          "title": "精炼标题",
          "summary": "2-3句摘要",
          "link": "原文链接",
          "source": "来源"
        }
      ]
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  const report = JSON.parse(content);

  console.log(`日报生成完成，包含 ${report.categories?.length || 0} 个分类`);
  return report;
}
