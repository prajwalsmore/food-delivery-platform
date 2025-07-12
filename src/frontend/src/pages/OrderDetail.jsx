import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle, MapPin, Phone } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrderDetails()
  }, [id])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/users/orders/${id}`)
      setOrder(response.data.order)
      setOrderItems(response.data.orderItems || [])
    } catch (error) {
      setError('Failed to load order details')
      console.error('Error loading order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'accepted':
      case 'preparing':
      case 'ready':
        return <Clock className="w-6 h-6 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
      case 'preparing':
      case 'ready':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Order received, waiting for restaurant confirmation'
      case 'accepted':
        return 'Order accepted by restaurant, preparing your food'
      case 'preparing':
        return 'Your food is being prepared'
      case 'ready':
        return 'Your order is ready for delivery'
      case 'delivered':
        return 'Order delivered successfully'
      case 'cancelled':
        return 'Order has been cancelled'
      default:
        return 'Unknown status'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadOrderDetails}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Order not found.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
        <p className="text-gray-600 mt-2">Order details and tracking information</p>
      </div>

      {/* Order Status */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          {getStatusIcon(order.status)}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
            <p className="text-gray-600">{getStatusDescription(order.status)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <div className="text-sm text-gray-500">
            Ordered on {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurant:</span>
              <span className="font-medium">{order.restaurant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">${order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.estimated_delivery_time && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">{new Date(order.estimated_delivery_time).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            </div>
            {order.delivery_instructions && (
              <div>
                <span className="text-gray-600">Instructions:</span>
                <p className="font-medium">{order.delivery_instructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        {orderItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No items found</div>
        ) : (
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-500">Notes: {item.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Contact */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Contact</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Restaurant:</span>
            <span className="font-medium">{order.restaurant_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{order.restaurant_address}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 