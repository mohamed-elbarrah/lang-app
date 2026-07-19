import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface RecentExam {
  id: string
  score: number | null
  questionCount: number
  date: string
}

export interface UserStats {
  totalExams: number
  averageScore: number | null
  bestScore: number | null
  recentExams: RecentExam[]
}

export interface ActiveProvider {
  name: string
  type: string
}

export interface AdminStats {
  totalUsers: number
  totalExams: number
  averageScore: number | null
  activeProvider: ActiveProvider | null
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['UserStats', 'AdminStats'],
  endpoints: (builder) => ({
    getUserStats: builder.query<UserStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['UserStats'],
    }),
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
  }),
})

export const { useGetUserStatsQuery, useGetAdminStatsQuery } = dashboardApi
