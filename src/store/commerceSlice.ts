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
    resetCommerce() {
      return initialState
    },
    /** Replaces the cart wholesale, used when syncing with the server. */
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.cartItems = action.payload
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload
    },
    /** Replaces the favorites wholesale, used when syncing with the server. */
    setFavoriteItems(state, action: PayloadAction<Product[]>) {
      state.favoriteItems = action.payload
    },
    setFavoritesOpen(state, action: PayloadAction<boolean>) {
      state.favoritesOpen = action.payload
    },
  },
})

export const {
  addToCart,
  changeCartQuantity,
  removeFromCart,
  resetCommerce,
  setCartItems,
  setCartOpen,
  setFavoriteItems,
  setFavoritesOpen,
} = commerceSlice.actions
export const commerceReducer = commerceSlice.reducer
