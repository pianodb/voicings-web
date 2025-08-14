// API configuration for different environments
const getApiBaseUrl = (): string => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, use the CDN directly
  return 'https://cdn-voicings.pianodb.org'
}

export const API_BASE_URL = getApiBaseUrl()

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/${endpoint}`
}
