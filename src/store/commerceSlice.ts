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
    addToCart(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const existing = state.cartItems.find((item) => item.product.name === action.payload.product.name)
      if (existing) existing.quantity += action.payload.quantity
      else state.cartItems.push(action.payload)
    },
    changeCartQuantity(state, action: PayloadAction<{ productName: string; quantity: number }>) {
      if (action.payload.quantity < 1) {
        state.cartItems = state.cartItems.filter((item) => item.product.name !== action.payload.productName)
        return
      }
      const item = state.cartItems.find((candidate) => candidate.product.name === action.payload.productName)
      if (item) item.quantity = action.payload.quantity
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.filter((item) => item.product.name !== action.payload)
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload
    },
    setFavoritesOpen(state, action: PayloadAction<boolean>) {
      state.favoritesOpen = action.payload
    },
    toggleFavorite(state, action: PayloadAction<Product>) {
      const index = state.favoriteItems.findIndex((item) => item.name === action.payload.name)
      if (index >= 0) state.favoriteItems.splice(index, 1)
      else state.favoriteItems.push(action.payload)
    },
  },
})

export const {
  addToCart,
  changeCartQuantity,
  removeFromCart,
  setCartOpen,
  setFavoritesOpen,
  toggleFavorite,
} = commerceSlice.actions
export const commerceReducer = commerceSlice.reducer
