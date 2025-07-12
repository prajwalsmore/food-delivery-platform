const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireRole, requireRestaurantOwnership } = require('../middleware/auth');

const router = express.Router();

// Get restaurant owner's restaurants
router.get('/my-restaurants', authenticateToken, requireRole(['restaurant']), (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT id, name, description, address, phone, cuisine_type, is_approved, created_at
    FROM restaurants
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  db.all(query, [userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ restaurants });
  });
});

// Create new restaurant
router.post('/', [
  authenticateToken,
  requireRole(['restaurant']),
  body('name').trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('address').trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('cuisineType').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, address, phone, cuisineType } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO restaurants (user_id, name, description, address, phone, cuisine_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [userId, name, description, address, phone, cuisineType], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create restaurant' });
      }
      res.status(201).json({
        message: 'Restaurant created successfully',
        restaurantId: this.lastID
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update restaurant
router.put('/:restaurantId', [
  authenticateToken,
  requireRole(['restaurant']),
  requireRestaurantOwnership,
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('address').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('cuisineType').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId } = req.params;
    const { name, description, address, phone, cuisineType } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (address) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (cuisineType !== undefined) {
      updateFields.push('cuisine_type = ?');
      updateValues.push(cuisineType);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(restaurantId);

    const query = `UPDATE restaurants SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.run(query, updateValues, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update restaurant' });
      }
      res.json({ message: 'Restaurant updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get restaurant menu (for restaurant owner)
router.get('/:restaurantId/menu', authenticateToken, requireRole(['restaurant']), requireRestaurantOwnership, (req, res) => {
  const { restaurantId } = req.params;
  
  const query = `
    SELECT id, name, description, price, category, is_available, image_url, created_at
    FROM menu_items
    WHERE restaurant_id = ?
    ORDER BY category, name
  `;
  
  db.all(query, [restaurantId], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ menuItems });
  });
});

// Add menu item
router.post('/:restaurantId/menu', [
  authenticateToken,
  requireRole(['restaurant']),
  requireRestaurantOwnership,
  body('name').trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0.01 }),
  body('category').optional().trim(),
  body('isAvailable').optional().isBoolean(),
  body('imageUrl').optional().isURL()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId } = req.params;
    const { name, description, price, category, isAvailable = true, imageUrl } = req.body;

    const query = `
      INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [restaurantId, name, description, price, category, isAvailable, imageUrl], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add menu item' });
      }
      res.status(201).json({
        message: 'Menu item added successfully',
        menuItemId: this.lastID
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update menu item
router.put('/:restaurantId/menu/:menuItemId', [
  authenticateToken,
  requireRole(['restaurant']),
  requireRestaurantOwnership,
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0.01 }),
  body('category').optional().trim(),
  body('isAvailable').optional().isBoolean(),
  body('imageUrl').optional().isURL()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, menuItemId } = req.params;
    const { name, description, price, category, isAvailable, imageUrl } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (price) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (isAvailable !== undefined) {
      updateFields.push('is_available = ?');
      updateValues.push(isAvailable);
    }
    if (imageUrl !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(imageUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(menuItemId, restaurantId);

    const query = `UPDATE menu_items SET ${updateFields.join(', ')} WHERE id = ? AND restaurant_id = ?`;
    
    db.run(query, updateValues, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json({ message: 'Menu item updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete menu item
router.delete('/:restaurantId/menu/:menuItemId', authenticateToken, requireRole(['restaurant']), requireRestaurantOwnership, (req, res) => {
  const { restaurantId, menuItemId } = req.params;

  db.run('DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?', [menuItemId, restaurantId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  });
});

// Get restaurant orders
router.get('/:restaurantId/orders', authenticateToken, requireRole(['restaurant']), requireRestaurantOwnership, (req, res) => {
  const { restaurantId } = req.params;
  
  const query = `
    SELECT o.id, o.total_amount, o.status, o.delivery_address, o.delivery_instructions,
           o.created_at, o.estimated_delivery_time,
           u.name as customer_name, u.phone as customer_phone
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.restaurant_id = ?
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [restaurantId], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders });
  });
});

// Get specific order details
router.get('/:restaurantId/orders/:orderId', authenticateToken, requireRole(['restaurant']), requireRestaurantOwnership, (req, res) => {
  const { restaurantId, orderId } = req.params;

  // Get order details
  const orderQuery = `
    SELECT o.*, u.name as customer_name, u.phone as customer_phone
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.id = ? AND o.restaurant_id = ?
  `;

  db.get(orderQuery, [orderId, restaurantId], (err, order) => {
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

// Update order status
router.put('/:restaurantId/orders/:orderId/status', [
  authenticateToken,
  requireRole(['restaurant']),
  requireRestaurantOwnership,
  body('status').isIn(['accepted', 'preparing', 'ready', 'delivered', 'cancelled'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, orderId } = req.params;
    const { status } = req.body;

    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND restaurant_id = ?', 
      [status, orderId, restaurantId], function(err) {
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

module.exports = router; 