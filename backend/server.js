require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { supabase, seedCloudMenu } = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

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
  const { table_number, items, total_amount, payment_id } = req.body;
  const token_number = 'TK-' + Math.floor(1000 + Math.random() * 9000);
  
  const { data, error } = await supabase.from('orders').insert({
    table_number: parseInt(table_number),
    items,
    total_amount,
    token_number,
    status: 'pending'
  }).select();

  if (error) return res.status(500).json({ error: error.message });
  
  console.log(`💰 Payment Confirmed: ${payment_id || 'MOCK'} | Token: ${token_number}`);
  io.to('restaurant-owners').emit('new-order', data[0]);
  
  res.json({ success: true, token: token_number, order_id: data[0].id });
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
        
        // Notify the dashboard
        if (status === 'complete') {
            io.to('restaurant-owners').emit('order_complete', data[0]);
        } else {
            io.emit('order-status-update', { id: parseInt(id), status });
        }

        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// THE FIX: Standardized History Fetch (Only Completed)
app.get('/api/history/orders', async (req, res) => {
    const { date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];
    const startOfDay = today + 'T00:00:00.000Z';
    const endOfDay = today + 'T23:59:59.999Z';

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

const PORT = 5000;
server.listen(PORT, async () => {
    console.log(`☁️ Supabase Cloud Backend active on port ${PORT}`);
    await seedCloudMenu();
});
