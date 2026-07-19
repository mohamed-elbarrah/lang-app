import { createApi } from '@reduxjs/toolkit/query/react'
import { loggingBaseQuery } from '../logging-base-query'

export interface AiProvider {
  id: string
  name: string
  providerType: string
  apiKey: string | null
  hasApiKey: boolean
  baseUrl: string | null
  isActive: boolean
  defaultModel: string | null
  models: ProviderModel[]
}

export interface ProviderModel {
  id: string
  providerId: string
  modelId: string
  modelName: string
  isEnabled: boolean
}

export interface CreateAiProviderInput {
  name: string
  providerType: string
  apiKey: string
  baseUrl?: string
  defaultModel?: string
  isActive?: boolean
}

export interface UpdateAiProviderInput {
  name?: string
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  isActive?: boolean
}

export const aiProvidersApi = createApi({
  reducerPath: 'aiProvidersApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['AIProviders', 'AIProvider'],
  endpoints: (builder) => ({
    getAIProviders: builder.query<AiProvider[], void>({
      query: () => '/ai-providers',
      providesTags: ['AIProviders'],
    }),
    getAIProvider: builder.query<AiProvider, string>({
      query: (id) => `/ai-providers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AIProvider', id }],
    }),
    createAIProvider: builder.mutation<AiProvider, CreateAiProviderInput>({
      query: (body) => ({
        url: '/ai-providers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AIProviders'],
    }),
    updateAIProvider: builder.mutation<AiProvider, { id: string; data: UpdateAiProviderInput }>({
      query: ({ id, data }) => ({
        url: `/ai-providers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => ['AIProviders', { type: 'AIProvider', id }],
    }),
    deleteAIProvider: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/ai-providers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AIProviders'],
    }),
    testConnection: builder.mutation<boolean, string>({
      query: (id) => ({
        url: '/ai-providers/test-connection',
        method: 'POST',
        body: { id },
      }),
    }),
    getModels: builder.query<ProviderModel[], string>({
      query: (id) => `/ai-providers/${id}/models`,
      providesTags: (_result, _error, id) => [{ type: 'AIProvider', id }],
    }),
    updateModels: builder.mutation<ProviderModel[], { id: string; models: { id: string; isEnabled: boolean }[] }>({
      query: ({ id, models }) => ({
        url: `/ai-providers/${id}/models`,
        method: 'PATCH',
        body: { models },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'AIProvider', id }],
    }),
    fetchModels: builder.mutation<ProviderModel[], string>({
      query: (id) => ({
        url: `/ai-providers/${id}/models`,
        method: 'GET',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'AIProvider', id }],
    }),
  }),
})

export const {
  useGetAIProvidersQuery,
  useGetAIProviderQuery,
  useCreateAIProviderMutation,
  useUpdateAIProviderMutation,
  useDeleteAIProviderMutation,
  useTestConnectionMutation,
  useGetModelsQuery,
  useUpdateModelsMutation,
  useFetchModelsMutation,
} = aiProvidersApi
