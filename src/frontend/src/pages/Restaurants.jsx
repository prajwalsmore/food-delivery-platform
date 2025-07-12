import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { MapPin, Phone, Star, Search } from 'lucide-react'

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/users/restaurants')
      setRestaurants(response.data.restaurants || [])
    } catch (error) {
      setError('Failed to load restaurants')
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          onClick={loadRestaurants}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurants
          </h1>
          <p className="text-gray-600 mt-2">
            Discover amazing restaurants and order delicious food
          </p>
        </div>
        
        {user?.role === 'restaurant' && (
          <Link
            to="/restaurant/dashboard"
            className="btn btn-primary"
          >
            Manage My Restaurants
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search restaurants, cuisine, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
      </div>

      {/* Restaurants grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'No restaurants found matching your search.' : 'No restaurants available.'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="card card-hover">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {restaurant.description}
                    </p>
                  )}
                </div>

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
                  
                  {restaurant.cuisine_type && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                        {restaurant.cuisine_type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>4.5 (120 reviews)</span>
                  </div>
                  
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="btn btn-primary"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 