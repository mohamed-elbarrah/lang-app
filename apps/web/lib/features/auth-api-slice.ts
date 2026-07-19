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

export interface Session {
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
    register: builder.mutation<User, RegisterInput>({
      query: (body) => ({
        url: '/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    login: builder.mutation<User, LoginInput>({
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
    getSession: builder.query<Session, void>({
      query: () => '/session',
      providesTags: ['Session'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
} = authApi
