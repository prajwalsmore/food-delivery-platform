const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireRole, getUserFromDB } = require('../middleware/auth');

const router = express.Router();

// Get all approved restaurants (public route)
router.get('/restaurants', (req, res) => {
  const query = `
    SELECT r.id, r.name, r.description, r.address, r.phone, r.cuisine_type,
           u.name as owner_name, r.created_at
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    WHERE r.is_approved = 1
    ORDER BY r.name
  `;
  
  db.all(query, [], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ restaurants });
  });
});

// Get single restaurant (public route)
router.get('/restaurants/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  const query = `
    SELECT r.id, r.name, r.description, r.address, r.phone, r.cuisine_type,
           u.name as owner_name, r.created_at
    FROM restaurants r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ? AND r.is_approved = 1
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

// Get restaurant menu (public route)
router.get('/restaurants/:restaurantId/menu', (req, res) => {
  const { restaurantId } = req.params;
  
  const query = `
    SELECT id, name, description, price, category, is_available, image_url
    FROM menu_items
    WHERE restaurant_id = ? AND is_available = 1
    ORDER BY category, name
  `;
  
  db.all(query, [restaurantId], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ menuItems });
  });
});

// Get user's cart
router.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT ci.id, ci.quantity, ci.created_at,
           mi.id as menu_item_id, mi.name, mi.description, mi.price, mi.image_url,
           r.id as restaurant_id, r.name as restaurant_name
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    JOIN restaurants r ON ci.restaurant_id = r.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `;
  
  db.all(query, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({ cartItems, total });
  });
});

// Add item to cart
router.post('/cart', [
  authenticateToken,
  body('menuItemId').isInt(),
  body('quantity').isInt({ min: 1 }),
  body('restaurantId').isInt()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { menuItemId, quantity, restaurantId } = req.body;
    const userId = req.user.id;

    // Check if menu item exists and is available
    db.get('SELECT id, price FROM menu_items WHERE id = ? AND restaurant_id = ? AND is_available = 1', 
      [menuItemId, restaurantId], (err, menuItem) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!menuItem) {
          return res.status(404).json({ error: 'Menu item not found or unavailable' });
        }

        // Check if item already in cart
        db.get('SELECT id, quantity FROM cart_items WHERE user_id = ? AND menu_item_id = ?', 
          [userId, menuItemId], (err, existingItem) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            if (existingItem) {
              // Update quantity
              const newQuantity = existingItem.quantity + quantity;
              db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', 
                [newQuantity, existingItem.id], function(err) {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update cart' });
                  }
                  res.json({ message: 'Cart updated successfully' });
                });
            } else {
              // Add new item
              db.run('INSERT INTO cart_items (user_id, restaurant_id, menu_item_id, quantity) VALUES (?, ?, ?, ?)', 
                [userId, restaurantId, menuItemId, quantity], function(err) {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to add to cart' });
                  }
                  res.json({ message: 'Item added to cart successfully' });
                });
            }
          });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/cart/:itemId', [
  authenticateToken,
  body('quantity').isInt({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    db.run('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', 
      [quantity, itemId, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Cart updated successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/:itemId', authenticateToken, (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart successfully' });
  });
});

// Clear cart
router.delete('/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Cart cleared successfully' });
  });
});

// Place order
router.post('/orders', [
  authenticateToken,
  body('deliveryAddress').trim().notEmpty(),
  body('deliveryInstructions').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deliveryAddress, deliveryInstructions } = req.body;
    const userId = req.user.id;

    // Get cart items
    const cartQuery = `
      SELECT ci.quantity, mi.id as menu_item_id, mi.price, ci.restaurant_id
      FROM cart_items ci
      JOIN menu_items mi ON ci.menu_item_id = mi.id
      WHERE ci.user_id = ?
    `;

    db.all(cartQuery, [userId], (err, cartItems) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Check if all items are from the same restaurant
      const restaurantIds = [...new Set(cartItems.map(item => item.restaurant_id))];
      if (restaurantIds.length > 1) {
        return res.status(400).json({ error: 'All items must be from the same restaurant' });
      }

      const restaurantId = restaurantIds[0];
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      db.run(`
        INSERT INTO orders (customer_id, restaurant_id, total_amount, delivery_address, delivery_instructions)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, restaurantId, totalAmount, deliveryAddress, deliveryInstructions], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = this.lastID;

        // Add order items
        const orderItemsQuery = 'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)';
        
        let completedItems = 0;
        cartItems.forEach((item, index) => {
          db.run(orderItemsQuery, [orderId, item.menu_item_id, item.quantity, item.price], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to add order items' });
            }
            completedItems++;
            
            if (completedItems === cartItems.length) {
              // Clear cart
              db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
                if (err) {
                  console.error('Failed to clear cart:', err);
                }
                res.status(201).json({
                  message: 'Order placed successfully',
                  orderId,
                  totalAmount
                });
              });
            }
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's order history
router.get('/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT o.id, o.total_amount, o.status, o.delivery_address, o.delivery_instructions,
           o.created_at, o.estimated_delivery_time,
           r.name as restaurant_name, r.address as restaurant_address
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.customer_id = ?
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [userId], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders });
  });
});

// Get specific order details
router.get('/orders/:orderId', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  // Get order details
  const orderQuery = `
    SELECT o.*, r.name as restaurant_name, r.address as restaurant_address
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = ? AND o.customer_id = ?
  `;

  db.get(orderQuery, [orderId, userId], (err, order) => {
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

module.exports = router; 