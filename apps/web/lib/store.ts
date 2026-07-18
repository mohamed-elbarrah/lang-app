import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth-slice'
import { authApi } from './features/auth-api-slice'
import { aiProvidersApi } from './features/ai-providers-api-slice'
import { usersApi } from './features/users-api-slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [aiProvidersApi.reducerPath]: aiProvidersApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, aiProvidersApi.middleware, usersApi.middleware),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
