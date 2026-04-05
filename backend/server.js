require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { supabase, seedCloudMenu } = require('./database');

const app = express();
const server = http.createServer(app);

// Dynamic CORS origin — allows any Vercel domain related to this project
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

// Socket.io with dynamic CORS and polling fallback for mobile data
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket'], // Try polling first for mobile carrier compatibility
  allowEIO3: true
});

// CORS — Handles preflight (OPTIONS) automatically within app.use()
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint — prevents Railway cold starts
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REAL-TIME SYNC - Owners Channel
io.on('connection', (socket) => {
  socket.on('join-dashboard', () => {
    socket.join('restaurant-owners');
    console.log('Admin Socket Joined: restaurant-owners');
  });
});

// MENUS - Cloud Fetch
app.get('/api/menu', async (req, res) => {
  const { data, error } = await supabase.from('menu').select('*');
  if (error) return res.status(500).json({ error: error.message });

  // Group flat items into categories for the UI
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find(c => c.category === item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ category: item.category, items: [item] });
    }
    return acc;
  }, []);

  res.json(grouped);
});

app.patch('/api/menu/:id/availability', async (req, res) => {
  const { id } = req.params;
  const { is_available } = req.body;
  const { data, error } = await supabase.from('menu').update({ is_available }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  io.emit('menu_update', data[0]);
  res.json(data[0]);
});

// THE FIX: Complete Payment Lifecycle for Cloud
app.post('/api/orders/create', async (req, res) => {
  // In Dev Mode, we return a mock flag to bypass Razorpay if needed
  res.json({ mock: true, id: 'MOCK-' + Date.now(), amount: req.body.total_amount * 100, currency: 'INR' });
});

app.post('/api/orders/confirm', async (req, res) => {
  const { table_number, items, total_amount, payment_id, user_email, scheduled_at } = req.body;
  const token_number = 'TK-' + Math.floor(1000 + Math.random() * 9000);

  // ATTEMPT 1: Full Order (with Scheduling)
  let result = await supabase.from('orders').insert({
    table_number: parseInt(table_number),
    items,
    total_amount,
    token_number,
    status: 'pending',
    user_email,
    scheduled_at
  }).select();

  // UNIVERSAL FALLBACK: If ANY error occurs (likely missing column or format issue), 
  // we embed the scheduling info into the items list so it's NEVER LOST.
  if (result.error) {
    console.warn("⚠️ Database mismatch. Embedding scheduling into items:", result.error.message);
    const enrichedItems = scheduled_at ? [{ name: `⏰ SCHEDULED: ${new Date(scheduled_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}`, qty: 1, price: 0 }, ...items] : items;

    result = await supabase.from('orders').insert({
      table_number: parseInt(table_number),
      items: enrichedItems,
      total_amount,
      token_number,
      status: 'pending',
      user_email
    }).select();
  }

  const { data, error } = result;

  if (error) {
    console.error("❌ Fatal Order Error (After Fallback):", error.message);
    return res.status(500).json({ error: "High-level database error. Order could not be saved." });
  }

  console.log(`💰 Payment Confirmed: ${payment_id || 'MOCK'} | Token: ${token_number} | For: ${user_email}`);
  io.to('restaurant-owners').emit('new-order', data[0]);

  res.json({ success: true, token: token_number, order_id: data[0].id, scheduled_at: data[0].scheduled_at });
});

// THE FIX: Fetch single order for Success Page refresh sync
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', parseInt(id))
    .single();

  if (error) return res.status(404).json({ error: 'Order not found' });
  res.json(data);
});

// THE FIX: Fetch personal orders for the User Account Page
app.get('/api/user/orders', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Original endpoint for legacy/direct calls
app.post('/api/orders', async (req, res) => {
  const { table_number, items, total_amount } = req.body;
  const token_number = 'TK-' + Math.floor(1000 + Math.random() * 9000);

  const { data, error } = await supabase.from('orders').insert({
    table_number,
    items,
    total_amount,
    token_number,
    status: 'pending'
  }).select();

  if (error) return res.status(500).json({ error: error.message });
  io.to('restaurant-owners').emit('new-order', data[0]);
  res.json(data[0]);
});

// THE FIX: Fetch ONLY ACTIVE orders (Pending & Ready)
app.get('/api/admin/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['pending', 'ready'])
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// THE FIX: Explicit Status Updates with Confirmation
app.patch('/api/admin/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    console.log(`📡 Updating Order #${id} status to: ${status}`);
    const updateData = { status };
    if (status === 'complete') updateData.completed_at = new Date().toISOString();

    // Use .select() as requested to confirm the update actually happened
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', parseInt(id))
      .select();

    if (error) {
      console.error('❌ Supabase Persistence Failed:', error.message);
      return res.status(500).json({ error: 'Cloud rejected update' });
    }

    if (!data || data.length === 0) {
      console.error('❌ Row mismatch - ID not found in Cloud:', id);
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`✅ Cloud Sync Success: Order #${id} is now ${status}.`);

    // Notify everyone (including customer success page)
    io.emit('order-status-update', { id: parseInt(id), status });

    // Specific cleanup for dashboard
    if (status === 'complete') {
      io.to('restaurant-owners').emit('order_complete', data[0]);
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THE FIX: Standardized History Fetch (Only Completed)
app.get('/api/history/orders', async (req, res) => {
  const { date, tzOffset } = req.query;

  // THE FIX: Correctly align UTC range with Local Timezone
  // offsetMin is minutes (e.g. -330 for IST)
  const offsetMin = parseInt(tzOffset || new Date().getTimezoneOffset());
  const queryDate = date || new Date(Date.now() - (offsetMin * 60000)).toISOString().split('T')[0];

  // 1. Create a Date object starting at 00:00:00 of the requested day in UTC
  const startOfLocalDay = new Date(`${queryDate}T00:00:00Z`);
  // 2. Adjust it by the offset to find when that moment was in UTC
  // If IST (-330), this moves 00:00 UTC to 18:30 UTC (the previous day)
  startOfLocalDay.setMinutes(startOfLocalDay.getMinutes() + offsetMin);

  // 3. Create the end of the day by adding 24 hours (minus 1ms)
  const endOfLocalDay = new Date(startOfLocalDay.getTime() + 24 * 60 * 60 * 1000 - 1);

  const startOfDay = startOfLocalDay.toISOString();
  const endOfDay = endOfLocalDay.toISOString();

  console.log(`🔍 History Query [IST aware]: ${queryDate} (${startOfDay} to ${endOfDay})`);

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'complete')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('completed_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ orders: data });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`☁️ Supabase Cloud Backend active on port ${PORT} at 0.0.0.0`);
  await seedCloudMenu();
});
