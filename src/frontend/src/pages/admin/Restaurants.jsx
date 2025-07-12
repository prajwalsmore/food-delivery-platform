import { useState, useEffect } from 'react'
import axios from 'axios'
import { Store, CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from 'lucide-react'

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPendingRestaurants()
  }, [])

  const loadPendingRestaurants = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/admin/restaurants/pending')
      setRestaurants(response.data)
    } catch (error) {
      setError('Failed to load pending restaurants')
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveRestaurant = async (restaurantId) => {
    try {
      await axios.put(`/admin/restaurants/${restaurantId}/approval`, { 
        approved: true 
      })
      await loadPendingRestaurants() // Reload restaurants
    } catch (error) {
      setError('Failed to approve restaurant')
      console.error('Error approving restaurant:', error)
    }
  }

  const rejectRestaurant = async (restaurantId) => {
    try {
      await axios.put(`/admin/restaurants/${restaurantId}/approval`, { 
        approved: false 
      })
      await loadPendingRestaurants() // Reload restaurants
    } catch (error) {
      setError('Failed to reject restaurant')
      console.error('Error rejecting restaurant:', error)
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
        <p className="text-gray-600 mt-2">Approve and manage restaurant registrations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pending Restaurants</h2>
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{restaurants.length} pending</span>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending restaurants</h3>
            <p className="text-gray-600">All restaurant applications have been processed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
                      </div>
                      <span className={getStatusBadge(restaurant.status)}>
                        {restaurant.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{restaurant.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{restaurant.owner_email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-600 mt-1">{restaurant.description}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Submitted:</span>
                          <p className="text-gray-600 mt-1">
                            {new Date(restaurant.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {restaurant.status === 'pending' && (
                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => approveRestaurant(restaurant.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectRestaurant(restaurant.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 