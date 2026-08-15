import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'dd MMM yyyy')
  } catch {
    return 'Invalid Date'
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a')
  } catch {
    return 'Invalid Date'
  }
}

export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return 'N/A'
  }
}

export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy')
  } catch {
    return 'N/A'
  }
}