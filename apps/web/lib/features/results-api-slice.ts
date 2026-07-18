import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface QuestionReview {
  id: string
  type: string
  content: Record<string, unknown>
  userAnswer: unknown
  isCorrect: boolean | null
  explanation: string | null
  order: number
  lessonTopic: string | null
}

export interface ExamResult {
  id: string
  userId: string
  questionCount: number
  correctionMode: string
  score: number | null
  status: string
  createdAt: string
  completedAt: string | null
  questions: QuestionReview[]
  summary: {
    correctCount: number
    incorrectCount: number
    unansweredCount: number
    totalQuestions: number
    topicsToReview: string[]
  }
}

export interface ResultListItem {
  id: string
  questionCount: number
  correctionMode: string
  score: number | null
  createdAt: string
  completedAt: string | null
}

export interface PaginatedResults {
  data: ResultListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const resultsApi = createApi({
  reducerPath: 'resultsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Results', 'Result'],
  endpoints: (builder) => ({
    getResults: builder.query<PaginatedResults, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/results',
        params,
      }),
      providesTags: ['Results'],
    }),
    getResultDetail: builder.query<ExamResult, string>({
      query: (examId) => `/results/${examId}`,
      providesTags: (_result, _error, examId) => [{ type: 'Result', id: examId }],
    }),
  }),
})

export const { useGetResultsQuery, useGetResultDetailQuery } = resultsApi
