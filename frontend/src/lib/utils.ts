import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date)) 
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  const formatted = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))

  // Ensure AM/PM is uppercase
  return formatted.replace(/am/gi, 'AM').replace(/pm/gi, 'PM')
}

export function formatDateTimeDetailed(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  const formatted = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))

  // Ensure AM/PM is uppercase
  return formatted.replace(/am/gi, 'AM').replace(/pm/gi, 'PM')
}

export function getPaymentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-muted/20 text-muted-foreground'
  }
}

export function getUserStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-600 text-white dark:bg-green-700 dark:text-green-100'
    case 'inactive':
      return 'bg-red-500 text-white dark:bg-red-600 dark:text-red-100'
    case 'suspended':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    default:
      return 'bg-muted/20 text-muted-foreground'
  }
}

export function unwrapResponse<T>(payload: any): T {
  if (payload === undefined || payload === null) {
    return payload as T
  }

  if (typeof payload === 'object') {
    const candidate = (payload as Record<string, unknown>)

    if (candidate.data !== undefined && candidate.data !== payload) {
      return unwrapResponse<T>(candidate.data)
    }

    if (candidate.result !== undefined) {
      return unwrapResponse<T>(candidate.result)
    }
  }

  return payload as T
}
