import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'

const baseFetch = fetchBaseQuery({ baseUrl: '/api' })

export const loggingBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestStart = Date.now()
  const method = typeof args === 'string' ? 'GET' : (args.method || 'GET')
  const url = typeof args === 'string' ? args : args.url

  console.log(`[API] ${method} ${url}`)

  const result = await baseFetch(args, api, extraOptions)

  const duration = Date.now() - requestStart

  if (result.error) {
    console.error(`[API] ${method} ${url} FAILED (${result.error.status}) ${duration}ms`, result.error.data)
    if (result.error.status === 429) {
      window.dispatchEvent(new CustomEvent('throttler-warning'))
    }
  } else {
    console.log(`[API] ${method} ${url} OK ${duration}ms`)
  }

  return result
}
