import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface StudyAnswer {
  id: string
  sessionId: string
  type: 'multiple_choice' | 'fill_blank' | 'error_correction' | 'sentence_creation' | 'scenario'
  content: Record<string, unknown>
  userAnswer: string | null
  isCorrect: boolean | null
  score: number | null
  explanation: string | null
  order: number
}

export interface StudyAnswerWithCorrect extends StudyAnswer {
  correctAnswer: string
}

export interface StudySession {
  id: string
  userId: string
  lessonId: string
  status: 'in_progress' | 'completed'
  score: number | null
  createdAt: string
  completedAt: string | null
  lesson: {
    id: string
    title: string
    part?: { id: string; name: string }
  }
  answers: StudyAnswer[]
}

export interface StudySessionListItem {
  id: string
  userId: string
  lessonId: string
  status: 'in_progress' | 'completed'
  score: number | null
  createdAt: string
  completedAt: string | null
  lesson: { id: string; title: string }
  exerciseCount: number
}

export interface StudySessionReview extends Omit<StudySession, 'answers'> {
  answers: StudyAnswerWithCorrect[]
}

export interface SubmitExerciseResult {
  index: number
  isCorrect: boolean
  correctAnswer: string
  explanation: string | null
  alreadyAnswered: boolean
}

export const studyApi = createApi({
  reducerPath: 'studyApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['StudySessions', 'StudySession'],
  endpoints: (builder) => ({
    startStudy: builder.mutation<StudySession, { lessonId: string }>({
      query: (body) => ({
        url: '/study',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudySessions'],
    }),
    getStudySessions: builder.query<StudySessionListItem[], void>({
      query: () => '/study',
      providesTags: ['StudySessions'],
    }),
    getStudySession: builder.query<StudySession, string>({
      query: (id) => `/study/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'StudySession', id }],
    }),
    getStudySessionReview: builder.query<StudySessionReview, string>({
      query: (id) => `/study/${id}/review`,
      providesTags: (_result, _error, id) => [{ type: 'StudySession', id }],
    }),
    submitStudyAnswer: builder.mutation<SubmitExerciseResult, { sessionId: string; exerciseIndex: number; answer: string }>({
      query: ({ sessionId, exerciseIndex, answer }) => ({
        url: `/study/${sessionId}/answers`,
        method: 'POST',
        body: { exerciseIndex, answer },
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [{ type: 'StudySession', id: sessionId }],
    }),
    completeStudy: builder.mutation<StudySession, string>({
      query: (id) => ({
        url: `/study/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['StudySessions', { type: 'StudySession', id }],
    }),
  }),
})

export const {
  useStartStudyMutation,
  useGetStudySessionsQuery,
  useGetStudySessionQuery,
  useGetStudySessionReviewQuery,
  useSubmitStudyAnswerMutation,
  useCompleteStudyMutation,
} = studyApi
