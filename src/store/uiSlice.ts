import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  /** Where to land after a successful sign-in. */
  authRedirect: string
  authModalOpen: boolean
  toast: string
}

const initialState: UiState = {
  authModalOpen: false,
  authRedirect: '',
  toast: '',
}

const uiSlice = createSlice({
  initialState,
  name: 'ui',
  reducers: {
    closeAuthModal(state) {
      state.authModalOpen = false
      state.authRedirect = ''
    },
    openAuthModal(state, action: PayloadAction<string | undefined>) {
      state.authModalOpen = true
      state.authRedirect = action.payload ?? ''
    },
    setToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
  },
})

export const { closeAuthModal, openAuthModal, setToast } = uiSlice.actions
export const uiReducer = uiSlice.reducer
