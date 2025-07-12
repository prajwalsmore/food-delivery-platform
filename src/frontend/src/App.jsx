import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Restaurants from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRestaurants from './pages/admin/Restaurants'
import AdminOrders from './pages/admin/Orders'
import RestaurantDashboard from './pages/restaurant/Dashboard'
import RestaurantMenu from './pages/restaurant/Menu'
import RestaurantOrders from './pages/restaurant/Orders'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:id" element={<RestaurantDetail />} />
        <Route path="orders/:id/track" element={<OrderDetail />} />
      </Route>

      {/* Protected customer routes */}
      <Route path="/" element={<Layout />}>
        <Route path="cart" element={user?.role === 'customer' ? <Cart /> : <Navigate to="/login" />} />
        <Route path="orders" element={user?.role === 'customer' ? <Orders /> : <Navigate to="/login" />} />
        <Route path="orders/:id" element={user?.role === 'customer' ? <OrderDetail /> : <Navigate to="/login" />} />
        <Route path="profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={user?.role === 'admin' ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Restaurant owner routes */}
      <Route path="/restaurant" element={user?.role === 'restaurant' ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/restaurant/dashboard" />} />
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="menu" element={<RestaurantMenu />} />
        <Route path="orders" element={<RestaurantOrders />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App 