import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Load cart items when user changes
  useEffect(() => {
    if (user?.role === 'customer') {
      loadCart()
    } else {
      setCartItems([])
    }
  }, [user])

  const loadCart = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await axios.get('/users/cart')
      setCartItems(response.data.cartItems || [])
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (menuItemId, quantity, restaurantId) => {
    if (!user) return { success: false, error: 'Please login to add items to cart' }

    try {
      await axios.post('/users/cart', {
        menuItemId,
        quantity,
        restaurantId
      })
      await loadCart() // Reload cart to get updated state
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add item to cart' 
      }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!user) return { success: false, error: 'Please login to update cart' }

    try {
      await axios.put(`/users/cart/${itemId}`, { quantity })
      await loadCart() // Reload cart to get updated state
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update cart item' 
      }
    }
  }

  const removeFromCart = async (itemId) => {
    if (!user) return { success: false, error: 'Please login to remove items from cart' }

    try {
      await axios.delete(`/users/cart/${itemId}`)
      await loadCart() // Reload cart to get updated state
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to remove item from cart' 
      }
    }
  }

  const clearCart = async () => {
    if (!user) return { success: false, error: 'Please login to clear cart' }

    try {
      await axios.delete('/users/cart')
      setCartItems([])
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to clear cart' 
      }
    }
  }

  const placeOrder = async (deliveryAddress, deliveryInstructions = '') => {
    if (!user) return { success: false, error: 'Please login to place order' }

    try {
      const response = await axios.post('/users/orders', {
        deliveryAddress,
        deliveryInstructions
      })
      await clearCart() // Clear cart after successful order
      return { success: true, orderId: response.data.orderId }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to place order' 
      }
    }
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  // Calculate cart item count
  const cartItemCount = cartItems.reduce((count, item) => {
    return count + item.quantity
  }, 0)

  const value = {
    cartItems,
    cartTotal,
    cartItemCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    placeOrder,
    loadCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 