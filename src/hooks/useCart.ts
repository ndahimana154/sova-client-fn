import { useCallback, useEffect, useRef } from 'react'
import type { Product } from '../data/catalog'
import type { CartItem } from '../features/cart/types'
import { cartLineKey } from '../lib/cartLine'
import { cartApi, type ServerCart } from '../lib/cartApi'
import { clearGuestCart, loadGuestCart, mergeableItems, saveGuestCart } from '../lib/guestCart'
import { mediaUrl } from '../lib/mediaUrl'
import { PRODUCT_PLACEHOLDER } from '../lib/constants'
import { setCartItems } from '../store/commerceSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setToast } from '../store/uiSlice'

function toCartItems(cart: ServerCart): CartItem[] {
  return cart.items.map((item) => ({
    options: item.product.variant.attributes.map(({ name, value }) => `${name}: ${value}`),
    product: {
      brand: item.product.brand ?? undefined,
      category: '',
      image: item.product.image ? mediaUrl(item.product.image.url) : PRODUCT_PLACEHOLDER,
      name: item.product.name,
      oldPrice: item.product.discountPercent > 0 ? item.product.listPrice : undefined,
      price: item.product.price,
      rating: 0,
      reviews: 0,
      slug: item.product.slug,
      variantId: item.product.variant.id,
    },
    quantity: item.quantity,
  }))
}

function lineInput(product: Product, quantity: number) {
  if (!product.slug) return null
  return { productSlug: product.slug, quantity, variantId: product.variantId }
}

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

  useEffect(() => {
    if (!authenticated) saveGuestCart(cartItems)
  }, [authenticated, cartItems])

  const findLine = useCallback(
    (key: string) => cartItems.find((item) => cartLineKey(item) === key),
    [cartItems],
  )

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const input = lineInput(product, quantity)
    if (authenticated && input) {
      try {
        applyServerCart(await cartApi.add(input))
        notify(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`)
      } catch {
        notify(
          (product.variantCount ?? 1) > 1 && !product.variantId
            ? 'Choose an option before adding this to your cart'
            : 'That item could not be added to your cart',
        )
      }
      return
    }
    const line: CartItem = { options: [], product, quantity }
    const key = cartLineKey(line)
    const existing = findLine(key)
    dispatch(setCartItems(existing
      ? cartItems.map((item) => cartLineKey(item) === key
        ? { ...item, quantity: item.quantity + quantity }
        : item)
      : [...cartItems, line]))
    notify(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your cart`)
  }, [applyServerCart, authenticated, cartItems, dispatch, findLine, notify])

  const removeFromCart = useCallback(async (key: string) => {
    const item = findLine(key)
    if (authenticated && item?.product.variantId) {
      try {
        applyServerCart(await cartApi.remove(item.product.variantId))
      } catch {
        notify('Could not remove that item')
      }
      return
    }
    dispatch(setCartItems(cartItems.filter((entry) => cartLineKey(entry) !== key)))
  }, [applyServerCart, authenticated, cartItems, dispatch, findLine, notify])

  const changeQuantity = useCallback(async (key: string, quantity: number) => {
    const item = findLine(key)
    if (!item) return
    if (quantity < 1) {
      await removeFromCart(key)
      return
    }
    const input = lineInput(item.product, quantity)
    if (authenticated && input && item.product.variantId) {
      const delta = quantity - item.quantity
      try {
        if (delta > 0) applyServerCart(await cartApi.add({ ...input, quantity: delta }))
        else {
          await cartApi.remove(item.product.variantId)
          applyServerCart(await cartApi.add(input))
        }
      } catch {
        notify('Could not update that quantity')
      }
      return
    }
    dispatch(setCartItems(cartItems.map((entry) => cartLineKey(entry) === key
      ? { ...entry, quantity }
      : entry)))
  }, [applyServerCart, authenticated, cartItems, dispatch, findLine, notify, removeFromCart])

  return {
    addToCart,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    cartItems,
    changeQuantity,
    removeFromCart,
  }
}
