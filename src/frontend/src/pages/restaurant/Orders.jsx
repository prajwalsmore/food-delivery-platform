import { useState, useEffect } from 'react'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, User, MapPin } from 'lucide-react'

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    loadRestaurants()
  }, [])

  useEffect(() => {
    if (selectedRestaurant) {
      loadOrders()
    }
  }, [selectedRestaurant])

  const loadRestaurants = async () => {
    try {
      const response = await axios.get('/restaurants/my-restaurants')
      setRestaurants(response.data)
      if (response.data.length > 0) {
        setSelectedRestaurant(response.data[0].id)
      }
    } catch (error) {
      setError('Failed to load restaurants')
      console.error('Error loading restaurants:', error)
    }
  }

  const loadOrders = async () => {
    if (!selectedRestaurant) return
    
    try {
      setLoading(true)
      const response = await axios.get(`/restaurants/${selectedRestaurant}/orders`)
      setOrders(response.data)
    } catch (error) {
      setError('Failed to load orders')
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/restaurants/${selectedRestaurant}/orders/${orderId}/status`, {
        status: newStatus
      })
      await loadOrders() // Reload orders
    } catch (error) {
      setError('Failed to update order status')
      console.error('Error updating order status:', error)
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'preparing':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'ready':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'out_for_delivery':
        return `${baseClasses} bg-indigo-100 text-indigo-800`
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    }
    return statusFlow[currentStatus] || null
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Orders</h1>
          <p className="text-gray-600 mt-2">Manage orders for your restaurants</p>
        </div>
        
        <div className="card">
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">You need to register a restaurant first to view orders.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Orders</h1>
        <p className="text-gray-600 mt-2">Manage orders for your restaurants</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Restaurant Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Select Restaurant:</label>
          <select
            value={selectedRestaurant || ''}
            onChange={(e) => setSelectedRestaurant(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{orders.length} orders</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Orders will appear here once customers start placing orders.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(order.status)}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Customer:</span>
                      <span className="text-gray-600">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Delivery Address:</span>
                      <span className="text-gray-600">{order.delivery_address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Payment Method:</span>
                      <span className="text-gray-600">{order.payment_method}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Special Instructions:</span>
                      <p className="text-gray-600 mt-1">
                        {order.special_instructions || 'No special instructions'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Update Status:</span>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Mark as {getNextStatus(order.status).replace('_', ' ')}
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 