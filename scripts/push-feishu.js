/**
 * 构建飞书卡片消息并推送到 webhook
 * @param {Object} report 日报数据
 */
export async function pushToFeishu(report) {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('未配置 FEISHU_WEBHOOK_URL，跳过飞书推送');
    return;
  }

  const card = buildFeishuCard(report);
  const payload = JSON.stringify(card);

  // 飞书卡片消息有大小限制（约 30KB），超出时精简内容
  if (payload.length > 28000) {
    console.warn('卡片消息过大，截断每分类到 3 条');
    report.categories.forEach((c) => (c.items = c.items.slice(0, 3)));
    return pushToFeishu(report);
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload
  });

  const result = await response.json();
  if (result.code !== 0) {
    throw new Error(`飞书推送失败: ${JSON.stringify(result)}`);
  }

  console.log('飞书推送成功');
}

/**
 * 构建飞书交互式卡片
 */
function buildFeishuCard(report) {
  const elements = [];

  // 今日概览
  elements.push({
    tag: 'markdown',
    content: `📋 **今日概览**\n${report.overview}`
  });
  elements.push({ tag: 'hr' });

  // 各分类
  for (const category of report.categories || []) {
    // 分类标题
    elements.push({
      tag: 'markdown',
      content: `**${category.name}**`
    });

    // 资讯列表
    const itemsText = category.items
      .map(
        (item, i) =>
          `${i + 1}. [${item.title}](${item.link})\n    ${item.summary}\n    _来源: ${item.source}_`
      )
      .join('\n\n');

    elements.push({
      tag: 'markdown',
      content: itemsText
    });
    elements.push({ tag: 'hr' });
  }

  return {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: `🤖 AI 日报 | ${report.date}` },
        template: 'blue'
      },
      elements
    }
  };
}
