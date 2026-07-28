import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { commerceReducer } from './commerceSlice'
import { uiReducer } from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    commerce: commerceReducer,
    ui: uiReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
