import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  testsTaken: number
  joinedAt: string
}

export interface PaginatedUsers {
  data: UserProfile[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    getMe: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<UserProfile, { name?: string }>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getUsers: builder.query<PaginatedUsers, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
})

export const { useGetMeQuery, useUpdateMeMutation, useGetUsersQuery, useDeleteUserMutation } = usersApi
