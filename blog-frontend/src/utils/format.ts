import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

// 格式化日期
export function formatDate(date: string | Date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date) {
  return dayjs(date).fromNow()
}

// 格式化数字
export function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 截断文本
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 解析标签
export function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(Boolean)
}
