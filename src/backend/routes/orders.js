const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireRole, requireOrderAccess } = require('../middleware/auth');

const router = express.Router();

// Get all orders (for admin)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const query = `
    SELECT o.id, o.total_amount, o.status, o.delivery_address, o.delivery_instructions,
           o.created_at, o.estimated_delivery_time,
           u.name as customer_name, u.phone as customer_phone,
           r.name as restaurant_name, r.address as restaurant_address
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    JOIN restaurants r ON o.restaurant_id = r.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders });
  });
});

// Get order by ID (for admin or order owner)
router.get('/:orderId', authenticateToken, requireOrderAccess, (req, res) => {
  const { orderId } = req.params;

  // Get order details
  const orderQuery = `
    SELECT o.*, u.name as customer_name, u.phone as customer_phone,
           r.name as restaurant_name, r.address as restaurant_address
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = ?
  `;

  db.get(orderQuery, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.quantity, oi.price, oi.notes,
             mi.name, mi.description, mi.image_url
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `;

    db.all(itemsQuery, [orderId], (err, orderItems) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ order, orderItems });
    });
  });
});

// Update order status (for admin)
router.put('/:orderId/status', [
  authenticateToken,
  requireRole(['admin']),
  body('status').isIn(['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [status, orderId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order status updated successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order statistics (for admin)
router.get('/stats/overview', authenticateToken, requireRole(['admin']), (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
      COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_orders,
      COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
      COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
      SUM(total_amount) as total_revenue
    FROM orders
  `;

  db.get(statsQuery, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ stats });
  });
});

// Get orders by date range (for admin)
router.get('/stats/by-date', authenticateToken, requireRole(['admin']), (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as order_count,
      SUM(total_amount) as daily_revenue
    FROM orders
    WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  db.all(query, [startDate, endDate], (err, dailyStats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ dailyStats });
  });
});

// Get top restaurants by orders (for admin)
router.get('/stats/top-restaurants', authenticateToken, requireRole(['admin']), (req, res) => {
  const { limit = 10 } = req.query;

  const query = `
    SELECT 
      r.name as restaurant_name,
      COUNT(o.id) as order_count,
      SUM(o.total_amount) as total_revenue,
      AVG(o.total_amount) as avg_order_value
    FROM restaurants r
    LEFT JOIN orders o ON r.id = o.restaurant_id
    WHERE r.is_approved = 1
    GROUP BY r.id, r.name
    ORDER BY order_count DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, topRestaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ topRestaurants });
  });
});

// Cancel order (for customer)
router.put('/:orderId/cancel', [
  authenticateToken,
  requireRole(['customer']),
  body('reason').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Check if order belongs to user and is cancellable
    db.get('SELECT status FROM orders WHERE id = ? AND customer_id = ?', [orderId, userId], (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Only allow cancellation of pending or accepted orders
      if (!['pending', 'accepted'].includes(order.status)) {
        return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
      }

      db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        ['cancelled', orderId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Order cancelled successfully' });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Track order (public endpoint for order tracking)
router.get('/:orderId/track', (req, res) => {
  const { orderId } = req.params;

  const query = `
    SELECT o.id, o.status, o.created_at, o.estimated_delivery_time,
           r.name as restaurant_name
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = ?
  `;

  db.get(query, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Define status descriptions
    const statusDescriptions = {
      'pending': 'Order received, waiting for restaurant confirmation',
      'accepted': 'Order accepted by restaurant, preparing your food',
      'preparing': 'Your food is being prepared',
      'ready': 'Your order is ready for delivery',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled'
    };

    res.json({
      orderId: order.id,
      status: order.status,
      statusDescription: statusDescriptions[order.status] || 'Unknown status',
      createdAt: order.created_at,
      estimatedDeliveryTime: order.estimated_delivery_time,
      restaurantName: order.restaurant_name
    });
  });
});

module.exports = router; 