import { useCallback, useEffect, useRef } from 'react'
import type { Product } from '../data/catalog'
import type { CartItem } from '../features/cart/types'
import { cartApi, type ServerCart } from '../lib/cartApi'
import { clearGuestCart, loadGuestCart, mergeableItems, saveGuestCart } from '../lib/guestCart'
import { mediaUrl } from '../lib/mediaUrl'
import { setCartItems } from '../store/commerceSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setToast } from '../store/uiSlice'

const PLACEHOLDER = '/images/storefront-hero.png'

function toCartItems(cart: ServerCart): CartItem[] {
  return cart.items.map((item) => ({
    product: {
      brand: item.product.brand ?? undefined,
      category: '',
      image: item.product.image ? mediaUrl(item.product.image.url) : PLACEHOLDER,
      name: item.product.name,
      oldPrice: item.product.discount > 0 ? item.product.price : undefined,
      price: item.product.finalPrice,
      rating: 0,
      reviews: 0,
      slug: item.product.slug,
    },
    quantity: item.quantity,
  }))
}

/**
 * One cart, two backing stores: the API when signed in, localStorage when not.
 * Signing in moves the guest cart to the server and empties local storage.
 */
export function useCart() {
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.auth.session)
  const cartItems = useAppSelector((state) => state.commerce.cartItems)
  const authenticated = Boolean(session)
  const mergedFor = useRef<string | null>(null)

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const applyServerCart = useCallback((cart: ServerCart) => {
    dispatch(setCartItems(toCartItems(cart)))
  }, [dispatch])

  // Load from the right place, merging any guest cart on the way in.
  useEffect(() => {
    if (!authenticated) {
      mergedFor.current = null
      dispatch(setCartItems(loadGuestCart()))
      return
    }
    const userId = session?.user?.id ?? 'me'
    if (mergedFor.current === userId) return
    mergedFor.current = userId

    const pending = mergeableItems(loadGuestCart())
    const load = pending.length ? cartApi.merge(pending) : cartApi.get()
    load
      .then((cart) => {
        applyServerCart(cart)
        if (pending.length) {
          clearGuestCart()
          notify('Your cart moved to your account')
        }
      })
      .catch(() => undefined)
  }, [applyServerCart, authenticated, dispatch, notify, session?.user?.id])

  // Guests keep their cart in localStorage on every change.
  useEffect(() => {
    if (!authenticated) saveGuestCart(cartItems)
  }, [authenticated, cartItems])

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (authenticated && product.slug) {
      try {
        applyServerCart(await cartApi.add(product.slug, quantity))
        notify(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`)
      } catch {
        notify('That item could not be added to your cart')
      }
      return
    }
    const existing = cartItems.find((item) => item.product.name === product.name)
    dispatch(setCartItems(existing
      ? cartItems.map((item) => item.product.name === product.name
        ? { ...item, quantity: item.quantity + quantity }
        : item)
      : [...cartItems, { product, quantity }]))
    notify(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`)
  }, [applyServerCart, authenticated, cartItems, dispatch, notify])

  const removeFromCart = useCallback(async (productName: string) => {
    const item = cartItems.find((entry) => entry.product.name === productName)
    if (authenticated && item?.product.slug) {
      try {
        applyServerCart(await cartApi.remove(item.product.slug))
      } catch {
        notify('Could not remove that item')
      }
      return
    }
    dispatch(setCartItems(cartItems.filter((entry) => entry.product.name !== productName)))
  }, [applyServerCart, authenticated, cartItems, dispatch, notify])

  const changeQuantity = useCallback(async (productName: string, quantity: number) => {
    const item = cartItems.find((entry) => entry.product.name === productName)
    if (!item) return
    if (quantity < 1) {
      await removeFromCart(productName)
      return
    }
    if (authenticated && item.product.slug) {
      const delta = quantity - item.quantity
      try {
        if (delta > 0) applyServerCart(await cartApi.add(item.product.slug, delta))
        else {
          // The API only adds, so step down by clearing the line and re-adding.
          await cartApi.remove(item.product.slug)
          applyServerCart(await cartApi.add(item.product.slug, quantity))
        }
      } catch {
        notify('Could not update that quantity')
      }
      return
    }
    dispatch(setCartItems(cartItems.map((entry) => entry.product.name === productName
      ? { ...entry, quantity }
      : entry)))
  }, [applyServerCart, authenticated, cartItems, dispatch, notify, removeFromCart])

  return {
    addToCart,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    cartItems,
    changeQuantity,
    removeFromCart,
  }
}
