// 1 → 壹、2 → 贰 …… 用于 section chapter mark
const NUMERALS = ['〇','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
export function n2z(n: number): string {
  if (n <= 0) return NUMERALS[0];
  if (n < 10) return NUMERALS[n];
  if (n === 10) return '拾';
  return NUMERALS[Math.floor(n / 10)] + '拾' + NUMERALS[n % 10];
}

// 节序数字 0X（公演用）
export function stageIdx(i: number): string {
  return (i + 1).toString().padStart(2, '0');
}

// 表演数个位数化（21 次）
export function timeAgo(date: string, now: Date): string {
  if (!date || date === '未知') return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const ms = now.getTime() - d.getTime();
  const days = Math.floor(ms / 86400000);
  if (days < 0) return date;
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}
