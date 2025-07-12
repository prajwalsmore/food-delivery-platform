const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (for admin)
router.get('/users', authenticateToken, requireRole(['admin']), (req, res) => {
  const query = `
    SELECT id, email, name, phone, address, role, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  
  db.all(query, [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users });
  });
});

// Get user by ID (for admin)
router.get('/users/:userId', authenticateToken, requireRole(['admin']), (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT id, email, name, phone, address, role, created_at
    FROM users
    WHERE id = ?
  `;

  db.get(query, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Update user role (for admin)
router.put('/users/:userId/role', [
  authenticateToken,
  requireRole(['admin']),
  body('role').isIn(['customer', 'restaurant', 'admin'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    db.run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [role, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User role updated successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (for admin)
router.delete('/users/:userId', authenticateToken, requireRole(['admin']), (req, res) => {
  const { userId } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get pending restaurant approvals (for admin)
router.get('/restaurants/pending', authenticateToken, requireRole(['admin']), (req, res) => {
  const query = `
    SELECT r.id, r.name, r.description, r.address, r.phone, r.cuisine_type, r.created_at,
           u.name as owner_name, u.email as owner_email
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    WHERE r.is_approved = 0
    ORDER BY r.created_at ASC
  `;
  
  db.all(query, [], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ restaurants });
  });
});

// Approve/reject restaurant (for admin)
router.put('/restaurants/:restaurantId/approval', [
  authenticateToken,
  requireRole(['admin']),
  body('isApproved').isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId } = req.params;
    const { isApproved } = req.body;

    db.run('UPDATE restaurants SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [isApproved ? 1 : 0, restaurantId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json({ 
          message: `Restaurant ${isApproved ? 'approved' : 'rejected'} successfully` 
        });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all restaurants (for admin)
router.get('/restaurants', authenticateToken, requireRole(['admin']), (req, res) => {
  const query = `
    SELECT r.id, r.name, r.description, r.address, r.phone, r.cuisine_type, 
           r.is_approved, r.created_at,
           u.name as owner_name, u.email as owner_email
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `;
  
  db.all(query, [], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ restaurants });
  });
});

// Get restaurant by ID (for admin)
router.get('/restaurants/:restaurantId', authenticateToken, requireRole(['admin']), (req, res) => {
  const { restaurantId } = req.params;

  const query = `
    SELECT r.*, u.name as owner_name, u.email as owner_email
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `;

  db.get(query, [restaurantId], (err, restaurant) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ restaurant });
  });
});

// Get dashboard analytics (for admin)
router.get('/analytics/dashboard', authenticateToken, requireRole(['admin']), (req, res) => {
  // Get user statistics
  const userStatsQuery = `
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
      COUNT(CASE WHEN role = 'restaurant' THEN 1 END) as restaurants,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
    FROM users
  `;

  // Get restaurant statistics
  const restaurantStatsQuery = `
    SELECT 
      COUNT(*) as total_restaurants,
      COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_restaurants,
      COUNT(CASE WHEN is_approved = 0 THEN 1 END) as pending_restaurants
    FROM restaurants
  `;

  // Get order statistics
  const orderStatsQuery = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as avg_order_value
    FROM orders
  `;

  db.get(userStatsQuery, [], (err, userStats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get(restaurantStatsQuery, [], (err, restaurantStats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      db.get(orderStatsQuery, [], (err, orderStats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          userStats,
          restaurantStats,
          orderStats
        });
      });
    });
  });
});

// Get recent activity (for admin)
router.get('/analytics/recent-activity', authenticateToken, requireRole(['admin']), (req, res) => {
  const { limit = 20 } = req.query;

  const query = `
    SELECT 
      'order' as type,
      o.id as item_id,
      o.created_at as timestamp,
      CONCAT('Order #', o.id, ' - $', o.total_amount) as description,
      u.name as user_name
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    
    UNION ALL
    
    SELECT 
      'restaurant' as type,
      r.id as item_id,
      r.created_at as timestamp,
      CONCAT('Restaurant: ', r.name) as description,
      u.name as user_name
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    
    UNION ALL
    
    SELECT 
      'user' as type,
      u.id as item_id,
      u.created_at as timestamp,
      CONCAT('User: ', u.name, ' (', u.role, ')') as description,
      u.name as user_name
    FROM users u
    
    ORDER BY timestamp DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, activities) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ activities });
  });
});

// Get revenue analytics (for admin)
router.get('/analytics/revenue', authenticateToken, requireRole(['admin']), (req, res) => {
  const { period = 'month' } = req.query;

  let dateFormat, groupBy;
  switch (period) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
      break;
    case 'week':
      dateFormat = '%Y-W%W';
      groupBy = 'strftime("%Y-W%W", created_at)';
      break;
    case 'month':
    default:
      dateFormat = '%Y-%m';
      groupBy = 'strftime("%Y-%m", created_at)';
      break;
  }

  const query = `
    SELECT 
      strftime(?, created_at) as period,
      COUNT(*) as order_count,
      SUM(total_amount) as revenue,
      AVG(total_amount) as avg_order_value
    FROM orders
    WHERE created_at >= date('now', '-6 months')
    GROUP BY ${groupBy}
    ORDER BY period DESC
  `;

  db.all(query, [dateFormat], (err, revenueData) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ revenueData });
  });
});

// Get system health (for admin)
router.get('/system/health', authenticateToken, requireRole(['admin']), (req, res) => {
  const healthChecks = {
    database: false,
    timestamp: new Date().toISOString()
  };

  // Test database connection
  db.get('SELECT 1 as test', [], (err, result) => {
    if (err) {
      healthChecks.database = false;
    } else {
      healthChecks.database = true;
    }

    res.json({
      status: healthChecks.database ? 'healthy' : 'unhealthy',
      checks: healthChecks
    });
  });
});

module.exports = router; 