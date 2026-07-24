import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth-slice'
import { authApi } from './features/auth-api-slice'
import { aiProvidersApi } from './features/ai-providers-api-slice'
import { usersApi } from './features/users-api-slice'
import { examsApi } from './features/exams-api-slice'
import { resultsApi } from './features/results-api-slice'
import { studyApi } from './features/study-api-slice'
import { dashboardApi } from './features/dashboard-api-slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [aiProvidersApi.reducerPath]: aiProvidersApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [examsApi.reducerPath]: examsApi.reducer,
      [resultsApi.reducerPath]: resultsApi.reducer,
      [studyApi.reducerPath]: studyApi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, aiProvidersApi.middleware, usersApi.middleware, examsApi.middleware, resultsApi.middleware, studyApi.middleware, dashboardApi.middleware),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
