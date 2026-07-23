import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'

const baseFetch = fetchBaseQuery({ baseUrl: '/api' })
const isDev = process.env.NODE_ENV !== 'production'

export const loggingBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestStart = Date.now()
  const method = typeof args === 'string' ? 'GET' : (args.method || 'GET')
  const url = typeof args === 'string' ? args : args.url

  if (isDev) {
    console.log(`[API] ${method} ${url}`)
  }

  const result = await baseFetch(args, api, extraOptions)

  const duration = Date.now() - requestStart

  if (result.error) {
    if (isDev) {
      console.error(`[API] ${method} ${url} FAILED (${result.error.status}) ${duration}ms`, result.error.data)
    }
    if (result.error.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        sessionStorage.setItem('redirect-after-login', window.location.pathname)
        window.location.href = '/login?expired=1'
      }
    } else if (result.error.status === 429) {
      window.dispatchEvent(new CustomEvent('throttler-warning'))
    }
  } else if (isDev) {
    console.log(`[API] ${method} ${url} OK ${duration}ms`)
  }

  return result
}
