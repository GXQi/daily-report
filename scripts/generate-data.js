import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 将日报数据写入前端 public 目录
 * @param {Object} report 日报数据
 */
export function writeReportData(report) {
  const dataDir = join(__dirname, '..', 'web', 'public', 'data');
  mkdirSync(dataDir, { recursive: true });

  const filePath = join(dataDir, 'latest.json');
  writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`前端数据已写入: ${filePath}`);
}
