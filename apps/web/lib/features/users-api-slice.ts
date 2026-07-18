import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  testsTaken: number
  joinedAt: string
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['User'],
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
  }),
})

export const { useGetMeQuery, useUpdateMeMutation } = usersApi
