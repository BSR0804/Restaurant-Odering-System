const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');
const Razorpay = require('razorpay');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For dev, allow all
  }
});

app.use(cors());
app.use(express.json());

// Socket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-dashboard', () => {
    socket.join('restaurant-owners');
    console.log('Socket joined channel: restaurant-owners');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Razorpay Initialization (Using demo keys if not in env)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

// Token Generation Utility (Daily reset-like prefix TK-xxxx)
const generateToken = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TK-${randomNum}`;
};

// --- API ROUTES ---

// GET: Full menu
app.get('/api/menu', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM menu').all();
    const menuItems = db.prepare('SELECT * FROM menu').all();
    
    // Group by category
    const groupedMenu = categories.map(cat => ({
      category: cat.category,
      items: menuItems.filter(item => item.category === cat.category)
    }));

    res.json(groupedMenu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create Order (Initiate checkout)
app.post('/api/orders/create', async (req, res) => {
  const { table_number, items, total_amount } = req.body;
  
  try {
    const options = {
      amount: total_amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`
    };

    // For mock/test: if keys are mock, just return a fake success response
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_mock' || !process.env.RAZORPAY_KEY_ID) {
        return res.json({ 
            id: `fake_pay_${Date.now()}`, 
            mock: true,
            msg: "Mock payment initiated. Development mode only." 
        });
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Confirm Payment & Create Order Record
app.post('/api/orders/confirm', async (req, res) => {
  const { table_number, items, total_amount, payment_id } = req.body;
  const token = generateToken();

  try {
    const stmt = db.prepare(`
      INSERT INTO orders (table_number, token_number, items, total_amount, payment_ref, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(table_number, token, JSON.stringify(items), total_amount, payment_id, 'paid');
    
    const orderData = {
      id: result.lastInsertRowid,
      table_number,
      token_number: token,
      items,
      total_amount,
      status: 'paid',
      created_at: new Date().toISOString()
    };

    // Emit Real-time notification to owners
    io.to('restaurant-owners').emit('new-order', orderData);
    
    res.json({ success: true, token, order_id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Active Dashboard Orders
app.get('/api/admin/orders', (req, res) => {
  try {
    // Only show non-completed orders for live dashboard
    const orders = db.prepare("SELECT * FROM orders WHERE status != 'completed' ORDER BY created_at DESC").all();
    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update Order Status (ready, completed)
app.patch('/api/admin/orders/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
        
        // Notify all clients (or just the specific one if we had order-specific rooms)
        // For simplicity in this scale, we broadcast, and clients filter by their own ID/Token
        io.emit('order-status-update', { id: parseInt(id), status });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Order History (Today's completed orders)
app.get('/api/history/orders', (req, res) => {
  try {
    const orders = db.prepare("SELECT * FROM orders WHERE status = 'completed' AND date(created_at) = date('now') ORDER BY created_at DESC").all();
    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Toggle Menu Item Availability (Individual)
app.patch('/api/menu/:id/availability', (req, res) => {
    const { is_available } = req.body;
    const { id } = req.params;

    try {
        db.prepare('UPDATE menu SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, id);
        
        // Broadcast the specific change
        io.emit('menu_update', { id: parseInt(id), is_available: !!is_available });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BATCH: Toggle Menu Item Availability (Bulk)
app.post('/api/menu/batch-availability', (req, res) => {
    const { ids, is_available } = req.body;

    try {
        const stmt = db.prepare('UPDATE menu SET is_available = ? WHERE id = ?');
        const updateBatch = db.transaction((itemIds) => {
            for (const id of itemIds) {
                stmt.run(is_available ? 1 : 0, id);
                io.emit('menu_update', { id: parseInt(id), is_available: !!is_available });
            }
        });

        updateBatch(ids);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
