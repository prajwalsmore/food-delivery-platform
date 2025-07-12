import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { MapPin, Phone, Star, Plus, ShoppingCart } from 'lucide-react'

export default function RestaurantDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadRestaurantData()
  }, [id])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      const [restaurantResponse, menuResponse] = await Promise.all([
        axios.get(`/users/restaurants/${id}`),
        axios.get(`/users/restaurants/${id}/menu`)
      ])
      setRestaurant(restaurantResponse.data.restaurant)
      setMenuItems(menuResponse.data.menuItems || [])
    } catch (error) {
      setError('Failed to load restaurant data')
      console.error('Error loading restaurant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (menuItem) => {
    if (!user) {
      setError('Please login to add items to cart')
      return
    }

    if (user.role !== 'customer') {
      setError('Only customers can add items to cart')
      return
    }

    const result = await addToCart(menuItem.id, 1, restaurant.id)
    
    if (result.success) {
      setSuccess(`${menuItem.name} added to cart!`)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error)
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !restaurant) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadRestaurantData}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Restaurant not found.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Restaurant Header */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-gray-600 mt-2">{restaurant.description}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{restaurant.address}</span>
              </div>
              {restaurant.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>4.5 (120 reviews)</span>
              </div>
              {restaurant.cuisine_type && (
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                  {restaurant.cuisine_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No menu items available.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    {item.category && (
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mt-2">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  
                  {user ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={user.role !== 'customer'}
                      className={`btn flex items-center space-x-2 ${
                        user.role === 'customer' 
                          ? 'btn-primary' 
                          : 'btn-secondary cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {user.role === 'customer' ? 'Add to Cart' : 'Customers Only'}
                      </span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Login to Add</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart CTA */}
      {user?.role === 'customer' ? (
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to order?</h3>
              <p className="text-sm text-gray-600">Add items to your cart and place your order</p>
            </div>
            <Link
              to="/cart"
              className="btn btn-primary flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>View Cart</span>
            </Link>
          </div>
        </div>
      ) : !user ? (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Want to order?</h3>
              <p className="text-sm text-gray-600">Login or register to add items to your cart</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Restaurant Owner</h3>
              <p className="text-sm text-gray-600">Restaurant owners cannot place orders</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 