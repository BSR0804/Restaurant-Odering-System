require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectDB, getDB, seedMenu, ensureIndexes } = require('./database');

const app = express();
const server = http.createServer(app);

// Dynamic CORS — allows any Vercel domain related to this project
const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (
    origin.includes('restaurant-odering-system') ||
    origin.includes('vercel.app') ||
    origin.includes('localhost')
  ) {
    return callback(null, true);
  }
  callback(new Error('Not allowed by CORS'));
};

const io = new Server(server, {
  cors: { origin: allowedOrigin, methods: ['GET', 'POST'] },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Reshape Mongo doc → API doc (string id, no _id)
const reshape = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
};

// Parse incoming id (accept ObjectId hex or plain string for legacy)
const toObjectId = (id) => {
  try { return new ObjectId(String(id)); } catch { return null; }
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  socket.on('join-dashboard', () => {
    socket.join('restaurant-owners');
    console.log('Admin Socket Joined: restaurant-owners');
  });
});

// MENUS
app.get('/api/menu', async (req, res) => {
  try {
    const docs = await getDB().collection('menu').find({}).toArray();
    const items = docs.map(reshape);

    const grouped = items.reduce((acc, item) => {
      const existing = acc.find(c => c.category === item.category);
      if (existing) existing.items.push(item);
      else acc.push({ category: item.category, items: [item] });
      return acc;
    }, []);

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id/availability', async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).json({ error: 'Invalid id' });

    const { is_available } = req.body;
    const result = await getDB().collection('menu').findOneAndUpdate(
      { _id },
      { $set: { is_available } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Item not found' });

    const updated = reshape(result);
    io.emit('menu_update', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ORDERS — Razorpay mock create
app.post('/api/orders/create', async (req, res) => {
  res.json({ mock: true, id: 'MOCK-' + Date.now(), amount: req.body.total_amount * 100, currency: 'INR' });
});

app.post('/api/orders/confirm', async (req, res) => {
  try {
    const { table_number, items, total_amount, payment_id, user_email, scheduled_at } = req.body;
    const token_number = 'TK-' + Math.floor(1000 + Math.random() * 9000);

    const doc = {
      table_number: parseInt(table_number),
      items,
      total_amount,
      token_number,
      status: 'pending',
      user_email,
      scheduled_at: scheduled_at || null,
      created_at: new Date(),
      completed_at: null
    };

    const result = await getDB().collection('orders').insertOne(doc);
    const saved = reshape({ _id: result.insertedId, ...doc });

    console.log(`💰 Payment Confirmed: ${payment_id || 'MOCK'} | Token: ${token_number} | For: ${user_email}`);
    io.to('restaurant-owners').emit('new-order', saved);

    res.json({ success: true, token: token_number, order_id: saved.id, scheduled_at: saved.scheduled_at });
  } catch (err) {
    console.error("❌ Order Error:", err.message);
    res.status(500).json({ error: "High-level database error. Order could not be saved." });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(404).json({ error: 'Order not found' });

    const doc = await getDB().collection('orders').findOne({ _id });
    if (!doc) return res.status(404).json({ error: 'Order not found' });
    res.json(reshape(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/orders', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const docs = await getDB().collection('orders')
      .find({ user_email: email })
      .sort({ created_at: -1 })
      .toArray();
    res.json(docs.map(reshape));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { table_number, items, total_amount } = req.body;
    const token_number = 'TK-' + Math.floor(1000 + Math.random() * 9000);

    const doc = {
      table_number: parseInt(table_number),
      items,
      total_amount,
      token_number,
      status: 'pending',
      user_email: null,
      scheduled_at: null,
      created_at: new Date(),
      completed_at: null
    };

    const result = await getDB().collection('orders').insertOne(doc);
    const saved = reshape({ _id: result.insertedId, ...doc });

    io.to('restaurant-owners').emit('new-order', saved);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACTIVE orders for admin
app.get('/api/admin/orders', async (req, res) => {
  try {
    const docs = await getDB().collection('orders')
      .find({ status: { $in: ['pending', 'ready'] } })
      .sort({ created_at: -1 })
      .toArray();
    res.json(docs.map(reshape));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(404).json({ error: 'Order not found' });

    const { status } = req.body;
    console.log(`📡 Updating Order #${req.params.id} status to: ${status}`);

    const update = { status };
    if (status === 'complete') update.completed_at = new Date();

    const result = await getDB().collection('orders').findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result) {
      console.error('❌ Row mismatch - ID not found:', req.params.id);
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = reshape(result);
    console.log(`✅ Order #${updated.id} is now ${status}.`);

    io.emit('order-status-update', { id: updated.id, status });
    if (status === 'complete') {
      io.to('restaurant-owners').emit('order_complete', updated);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HISTORY (IST-aware)
app.get('/api/history/orders', async (req, res) => {
  try {
    const { date, tzOffset } = req.query;
    const offsetMin = parseInt(tzOffset || new Date().getTimezoneOffset());
    const queryDate = date || new Date(Date.now() - (offsetMin * 60000)).toISOString().split('T')[0];

    const startOfLocalDay = new Date(`${queryDate}T00:00:00Z`);
    startOfLocalDay.setMinutes(startOfLocalDay.getMinutes() + offsetMin);
    const endOfLocalDay = new Date(startOfLocalDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    console.log(`🔍 History Query [IST aware]: ${queryDate} (${startOfLocalDay.toISOString()} to ${endOfLocalDay.toISOString()})`);

    const docs = await getDB().collection('orders')
      .find({
        status: 'complete',
        created_at: { $gte: startOfLocalDay, $lte: endOfLocalDay }
      })
      .sort({ completed_at: -1 })
      .toArray();

    res.json({ orders: docs.map(reshape) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await ensureIndexes();
    await seedMenu();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🍃 MongoDB Backend active on port ${PORT} at 0.0.0.0`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();
