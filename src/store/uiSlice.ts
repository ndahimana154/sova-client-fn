import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  toast: string
}

const initialState: UiState = {
  toast: '',
}

const uiSlice = createSlice({
  initialState,
  name: 'ui',
  reducers: {
    setToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
  },
})

export const { setToast } = uiSlice.actions
export const uiReducer = uiSlice.reducer
