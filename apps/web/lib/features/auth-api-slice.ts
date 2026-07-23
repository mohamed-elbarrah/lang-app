import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface SessionResponse {
  user: User | null
  session: { id: string; expiresAt: string } | null
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
}

export interface LoginInput {
  email: string
  password: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterInput>({
      query: (body) => ({
        url: '/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    login: builder.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: '/signin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/signout',
        method: 'POST',
      }),
      invalidatesTags: ['Session'],
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => '/session',
      providesTags: ['Session'],
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordInput>({
      query: (body) => ({
        url: '/change-password',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string }, ForgotPasswordInput>({
      query: (body) => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, ResetPasswordInput>({
      query: (body) => ({
        url: '/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
