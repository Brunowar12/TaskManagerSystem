import { format } from 'date-fns'

export function formatDate(date: Date | string): string {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)

  // Проверка на корректность даты
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return format(parsedDate, 'MMM dd, yyyy hh:mm a')
}
