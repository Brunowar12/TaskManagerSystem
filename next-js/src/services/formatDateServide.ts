import { format } from 'date-fns'

export function formatDate(date: Date | string): string {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)

  // Checking the date for correctness
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return format(parsedDate, 'MMM dd, yyyy hh:mm a')
}
