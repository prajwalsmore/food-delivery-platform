const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Get user from database
const getUserFromDB = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const query = 'SELECT id, email, name, phone, address, role, created_at FROM users WHERE id = ?';
  db.get(query, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userData = user;
    next();
  });
};

// Check if restaurant exists and user owns it
const requireRestaurantOwnership = (req, res, next) => {
  const restaurantId = req.params.restaurantId || req.body.restaurant_id;
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID required' });
  }

  const query = `
    SELECT r.* FROM restaurants r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.id = ? AND u.id = ?
  `;
  
  db.get(query, [restaurantId, req.user.id], (err, restaurant) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!restaurant) {
      return res.status(403).json({ error: 'Restaurant not found or access denied' });
    }
    req.restaurant = restaurant;
    next();
  });
};

// Check if order exists and user has access
const requireOrderAccess = (req, res, next) => {
  const orderId = req.params.orderId;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }

  const query = `
    SELECT o.*, u.role FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.id = ?
  `;
  
  db.get(query, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user has access to this order
    const isOwner = order.customer_id === req.user.id;
    const isRestaurantOwner = req.user.role === 'restaurant' && 
      req.restaurant && req.restaurant.id === order.restaurant_id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isRestaurantOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied to this order' });
    }
    
    req.order = order;
    next();
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  getUserFromDB,
  requireRestaurantOwnership,
  requireOrderAccess
}; 