import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '../data/catalog'

interface CommerceState {
  favoriteItems: Product[]
  favoritesOpen: boolean
}

const initialState: CommerceState = {
  favoriteItems: [],
  favoritesOpen: false,
}

const commerceSlice = createSlice({
  initialState,
  name: 'commerce',
  reducers: {
    resetCommerce() {
      return initialState
    },
    setFavoriteItems(state, action: PayloadAction<Product[]>) {
      state.favoriteItems = action.payload
    },
    setFavoritesOpen(state, action: PayloadAction<boolean>) {
      state.favoritesOpen = action.payload
    },
  },
})

export const {
  resetCommerce,
  setFavoriteItems,
  setFavoritesOpen,
} = commerceSlice.actions
export const commerceReducer = commerceSlice.reducer
