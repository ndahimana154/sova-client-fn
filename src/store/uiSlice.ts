import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sellerSidebarCollapsed: boolean
  sellerSidebarOpen: boolean
}

const initialState: UiState = {
  sellerSidebarCollapsed: false,
  sellerSidebarOpen: false,
}

const uiSlice = createSlice({
  initialState,
  name: 'ui',
  reducers: {
    setSellerSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sellerSidebarOpen = action.payload
    },
    toggleSellerSidebarCollapsed(state) {
      state.sellerSidebarCollapsed = !state.sellerSidebarCollapsed
    },
  },
})

export const { setSellerSidebarOpen, toggleSellerSidebarCollapsed } = uiSlice.actions
export const uiReducer = uiSlice.reducer
