import { cn as uiCN } from 'ui'

/**
 * Utility function for conditionally joining classNames
 */
export const cn = uiCN

/**
 * Formats a date string or timestamp into a localized date string
 * @param input - Date string or timestamp
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @param options - DateTimeFormatOptions to customize output
 * @returns Formatted date string
 */
export function formatDate(
  input: string | number,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const date = new Date(input)
  return date.toLocaleDateString(locale, options)
}

/**
 * Formats a date string or timestamp into a relative time string (e.g., "2 days ago")
 * @param input - Date string or timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(input: string | number): string {
  const date = new Date(input)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`
    }
  }
  
  return 'just now'
}

/**
 * Creates an absolute URL from a relative path
 * @param path - Relative path
 * @returns Absolute URL
 */
export function absoluteUrl(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  return `${appUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitalizes the first letter of a string
 * @param text - Input string
 * @returns Capitalized string
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Safely access nested object properties
 * @param obj - Object to access
 * @param path - Path to the property (e.g., 'user.profile.name')
 * @param defaultValue - Default value if property doesn't exist
 * @returns Property value or default value
 */
export function getNestedValue<T>(
  obj: Record<string, any>,
  path: string,
  defaultValue: T
): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue
    }
    result = result[key]
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T
}

/**
 * Debounces a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Extracts query parameters from a URL
 * @param url - URL string
 * @returns Object with query parameters
 */
export function getQueryParams(url: string): Record<string, string> {
  const params = new URLSearchParams(url.split('?')[1])
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}
