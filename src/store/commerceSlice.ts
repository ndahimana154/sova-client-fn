import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '../data/catalog'
import type { CartItem } from '../features/cart/types'

interface CommerceState {
  cartItems: CartItem[]
  cartOpen: boolean
  favoriteItems: Product[]
  favoritesOpen: boolean
}

const initialState: CommerceState = {
  cartItems: [],
  cartOpen: false,
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
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.cartItems = action.payload
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload
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
  setCartItems,
  setCartOpen,
  setFavoriteItems,
  setFavoritesOpen,
} = commerceSlice.actions
export const commerceReducer = commerceSlice.reducer
