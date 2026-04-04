require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Automated Cloud Seeding Engine
const seedCloudMenu = async () => {
    try {
        const { data: existing } = await supabase.from('menu').select('id').limit(1);
        if (existing && existing.length > 0) {
            console.log("📊 Cloud Menu: Already Seeded.");
            return;
        }

        console.log("☁️ Seeding Supabase Cloud Menu...");
        const menuItems = [
            { name: 'Veg. Manchow Soup', category: 'Soup', price: 140, is_available: true },
            { name: 'Veg. Lemon Coriander Soup', category: 'Soup', price: 130, is_available: true },
            { name: 'Paneer Tikka', category: 'Tandoori', price: 280, is_available: true },
            { name: 'Hara Bhara Kabab', category: 'Tandoori', price: 240, is_available: true },
            { name: 'Dal Tadka', category: 'Main Course', price: 210, is_available: true },
            { name: 'Paneer Butter Masala', category: 'Main Course', price: 320, is_available: true },
            { name: 'Butter Naan', category: 'Breads', price: 60, is_available: true },
            { name: 'Gulab Jamun (2pc)', category: 'Dessert', price: 90, is_available: true }
        ];

        const { error } = await supabase.from('menu').insert(menuItems);
        if (error) throw error;
        console.log("✅ Cloud Menu Seeded Successfully.");
    } catch (err) {
        console.error("❌ Cloud Seed Error:", err.message);
    }
};

module.exports = { supabase, seedCloudMenu };
