import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface Question {
  id: string
  examId: string
  type: 'multiple_choice' | 'fill_blank' | 'error_correction' | 'sentence_creation' | 'scenario'
  content: Record<string, unknown>
  userAnswer: unknown
  isCorrect: boolean | null
  explanation: string | null
  order: number
  lessonTopic: string | null
}

export interface Exam {
  id: string
  userId: string
  questionCount: number
  level: 'beginner' | 'intermediate' | 'advanced'
  correctionMode: 'instant' | 'final'
  status: 'generating' | 'in_progress' | 'completed'
  score: number | null
  createdAt: string
  completedAt: string | null
  questions: Question[]
}

export interface ExamListItem {
  id: string
  questionCount: number
  level: 'beginner' | 'intermediate' | 'advanced'
  correctionMode: string
  status: string
  score: number | null
  createdAt: string
  completedAt: string | null
}

export interface PaginatedExams {
  data: ExamListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SubmitAnswerResult {
  completed: boolean
  isCorrect: boolean
  explanation: string | null
  nextQuestion?: Question
  progress: {
    answered: number
    total: number
  }
}

export interface CreateExamInput {
  level: 'beginner' | 'intermediate' | 'advanced'
  lessonIds: string[]
  questionCount?: number
  correctionMode?: 'instant' | 'final'
}

export const examsApi = createApi({
  reducerPath: 'examsApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['Exams', 'Exam', 'Results'],
  endpoints: (builder) => ({
    createExam: builder.mutation<Exam, CreateExamInput>({
      query: (body) => ({
        url: '/exams',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Exams'],
    }),
    getExams: builder.query<PaginatedExams, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/exams',
        params,
      }),
      providesTags: ['Exams'],
    }),
    getExam: builder.query<Exam, string>({
      query: (id) => `/exams/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Exam', id }],
    }),
    getCurrentQuestion: builder.query<Question | { completed: boolean; examId: string }, string>({
      query: (id) => `/exams/${id}/current-question`,
      providesTags: (_result, _error, id) => [{ type: 'Exam', id }],
    }),
    submitAnswer: builder.mutation<SubmitAnswerResult, { examId: string; questionId: string; answer: unknown }>({
      query: ({ examId, questionId, answer }) => ({
        url: `/exams/${examId}/answers`,
        method: 'POST',
        body: { questionId, answer },
      }),
      invalidatesTags: (_result, _error, { examId }) => ['Exams', { type: 'Exam', id: examId }, 'Results'],
    }),
    completeExam: builder.mutation<Exam, string>({
      query: (id) => ({
        url: `/exams/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Exams', { type: 'Exam', id }, 'Results'],
    }),
    switchMode: builder.mutation<Exam, { id: string; correctionMode: 'instant' | 'final' }>({
      query: ({ id, correctionMode }) => ({
        url: `/exams/${id}/mode`,
        method: 'PATCH',
        body: { correctionMode },
      }),
      invalidatesTags: (_result, _error, { id }) => ['Exams', { type: 'Exam', id }],
    }),
    retakeExam: builder.mutation<Exam, string>({
      query: (id) => ({
        url: `/exams/${id}/retake`,
        method: 'POST',
      }),
      invalidatesTags: ['Exams'],
    }),
  }),
})

export const {
  useCreateExamMutation,
  useGetExamsQuery,
  useGetExamQuery,
  useGetCurrentQuestionQuery,
  useSubmitAnswerMutation,
  useCompleteExamMutation,
  useSwitchModeMutation,
  useRetakeExamMutation,
} = examsApi
