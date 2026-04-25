require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'kc_restaurant';

if (!uri) {
    console.error("Missing MONGODB_URI in .env");
}

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    retryWrites: true,
});

let db = null;

const connectDB = async () => {
    if (db) return db;
    await client.connect();
    db = client.db(dbName);
    console.log(`🍃 MongoDB connected: ${dbName}`);
    return db;
};

const getDB = () => {
    if (!db) throw new Error('DB not initialized — call connectDB() first');
    return db;
};

// Grillz Point — Reliance Mall, Sec-13 Dwarka
const GRILLZ_POINT_MENU = [
    // PIZZA — Veg
    { name: 'Spl. Paneer Cheese Pizza (Small)', category: 'Pizza', price: 149, type: 'veg', is_available: true },
    { name: 'Spl. Paneer Cheese Pizza (Large)', category: 'Pizza', price: 239, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Pizza (Small)', category: 'Pizza', price: 149, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Pizza (Large)', category: 'Pizza', price: 239, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Pizza (Small)', category: 'Pizza', price: 149, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Pizza (Large)', category: 'Pizza', price: 239, type: 'veg', is_available: true },
    { name: 'Cheese Margherita Pizza (Small)', category: 'Pizza', price: 119, type: 'veg', is_available: true },
    { name: 'Cheese Margherita Pizza (Large)', category: 'Pizza', price: 209, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Tomato Pizza (Small)', category: 'Pizza', price: 129, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Tomato Pizza (Large)', category: 'Pizza', price: 219, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Tomato, Paneer Pizza (Small)', category: 'Pizza', price: 139, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Tomato, Paneer Pizza (Large)', category: 'Pizza', price: 229, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Sweet Corn Pizza (Small)', category: 'Pizza', price: 149, type: 'veg', is_available: true },
    { name: 'Onion, Caps, Sweet Corn Pizza (Large)', category: 'Pizza', price: 239, type: 'veg', is_available: true },
    { name: 'Onion Caps, Sweet Corn Mushroom Pizza (Small)', category: 'Pizza', price: 159, type: 'veg', is_available: true },
    { name: 'Onion Caps, Sweet Corn Mushroom Pizza (Large)', category: 'Pizza', price: 249, type: 'veg', is_available: true },
    // PIZZA — Non Veg
    { name: 'Chicken Seekh Pizza (Small)', category: 'Pizza', price: 159, type: 'non-veg', is_available: true },
    { name: 'Chicken Seekh Pizza (Large)', category: 'Pizza', price: 249, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Pizza (Small)', category: 'Pizza', price: 159, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Pizza (Large)', category: 'Pizza', price: 249, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Pizza (Small)', category: 'Pizza', price: 179, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Pizza (Large)', category: 'Pizza', price: 259, type: 'non-veg', is_available: true },
    { name: 'Chicken Makhani Pizza (Small)', category: 'Pizza', price: 179, type: 'non-veg', is_available: true },
    { name: 'Chicken Makhani Pizza (Large)', category: 'Pizza', price: 259, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Pizza (Small)', category: 'Pizza', price: 179, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Pizza (Large)', category: 'Pizza', price: 259, type: 'non-veg', is_available: true },

    // GRILLED SANDWICH — Veg
    { name: 'Veg Sandwich (Coleslaw)', category: 'Grilled Sandwich', price: 119, type: 'veg', is_available: true },
    { name: 'Veg Sandwich Combo (Coleslaw + Fries + Ice Tea)', category: 'Grilled Sandwich', price: 219, type: 'veg', is_available: true },
    { name: 'Spice Sandwich', category: 'Grilled Sandwich', price: 119, type: 'veg', is_available: true },
    { name: 'Spice Sandwich Combo', category: 'Grilled Sandwich', price: 219, type: 'veg', is_available: true },
    { name: 'Garden Fresh Sandwich', category: 'Grilled Sandwich', price: 129, type: 'veg', is_available: true },
    { name: 'Garden Fresh Sandwich Combo', category: 'Grilled Sandwich', price: 229, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Sandwich', category: 'Grilled Sandwich', price: 129, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Sandwich Combo', category: 'Grilled Sandwich', price: 229, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Sandwich', category: 'Grilled Sandwich', price: 129, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Sandwich Combo', category: 'Grilled Sandwich', price: 229, type: 'veg', is_available: true },
    { name: 'Paneer Schezwan Sandwich', category: 'Grilled Sandwich', price: 129, type: 'veg', is_available: true },
    { name: 'Paneer Schezwan Sandwich Combo', category: 'Grilled Sandwich', price: 229, type: 'veg', is_available: true },
    // GRILLED SANDWICH — Non Veg
    { name: 'Chicken Seekh Kabab Sandwich', category: 'Grilled Sandwich', price: 129, type: 'non-veg', is_available: true },
    { name: 'Chicken Seekh Kabab Sandwich Combo', category: 'Grilled Sandwich', price: 229, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Sandwich', category: 'Grilled Sandwich', price: 139, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Sandwich Combo', category: 'Grilled Sandwich', price: 239, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Sandwich', category: 'Grilled Sandwich', price: 139, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Sandwich Combo', category: 'Grilled Sandwich', price: 239, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Sandwich', category: 'Grilled Sandwich', price: 149, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Sandwich Combo', category: 'Grilled Sandwich', price: 249, type: 'non-veg', is_available: true },
    { name: 'Chicken Makhani Sandwich', category: 'Grilled Sandwich', price: 149, type: 'non-veg', is_available: true },
    { name: 'Chicken Makhani Sandwich Combo', category: 'Grilled Sandwich', price: 249, type: 'non-veg', is_available: true },
    { name: 'Chicken Punjabi Tikka Sandwich', category: 'Grilled Sandwich', price: 149, type: 'non-veg', is_available: true },

    // PASTA — Veg
    { name: 'Onion Capsicum Pasta', category: 'Pasta', price: 179, type: 'veg', is_available: true },
    { name: 'Onion Capsicum Pasta Combo (+ Cheese Garlic Bread)', category: 'Pasta', price: 249, type: 'veg', is_available: true },
    { name: 'Onion Capsicum Sweet Corn Pasta', category: 'Pasta', price: 179, type: 'veg', is_available: true },
    { name: 'Onion Capsicum Sweet Corn Pasta Combo', category: 'Pasta', price: 249, type: 'veg', is_available: true },
    { name: 'Onion Capsicum Sweet Corn Mushroom Pasta', category: 'Pasta', price: 189, type: 'veg', is_available: true },
    { name: 'Onion Capsicum Sweet Corn Mushroom Pasta Combo', category: 'Pasta', price: 259, type: 'veg', is_available: true },
    // PASTA — Non Veg
    { name: 'Chicken Salami Pasta', category: 'Pasta', price: 199, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Pasta Combo', category: 'Pasta', price: 269, type: 'non-veg', is_available: true },
    { name: 'Chicken Seekh Pasta', category: 'Pasta', price: 199, type: 'non-veg', is_available: true },
    { name: 'Chicken Seekh Pasta Combo', category: 'Pasta', price: 269, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Pasta', category: 'Pasta', price: 209, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Pasta Combo', category: 'Pasta', price: 279, type: 'non-veg', is_available: true },

    // LASAGNA
    { name: 'Veg Lasanga', category: 'Lasanga', price: 229, type: 'veg', is_available: true },
    { name: 'Veg Lasanga Combo (+ Cheese Garlic Bread)', category: 'Lasanga', price: 299, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Lasanga', category: 'Lasanga', price: 249, type: 'veg', is_available: true },
    { name: 'Paneer Makhani Lasanga Combo', category: 'Lasanga', price: 319, type: 'veg', is_available: true },
    { name: 'Chicken Makhani Lasanga', category: 'Lasanga', price: 259, type: 'non-veg', is_available: true },
    { name: 'Chicken Makhani Lasanga Combo', category: 'Lasanga', price: 329, type: 'non-veg', is_available: true },

    // GRILLED BURGER — Veg
    { name: 'Aloo Tikki Grilled Burger', category: 'Grilled Burger', price: 59, type: 'veg', is_available: true },
    { name: 'Aloo Tikki Grilled Burger Combo (+ Fries + Ice Tea)', category: 'Grilled Burger', price: 159, type: 'veg', is_available: true },
    { name: 'Aloo Tikki Coleslaw Burger', category: 'Grilled Burger', price: 79, type: 'veg', is_available: true },
    { name: 'Aloo Tikki Coleslaw Burger Combo', category: 'Grilled Burger', price: 179, type: 'veg', is_available: true },
    { name: 'Veg Grilled Paneer Burger', category: 'Grilled Burger', price: 89, type: 'veg', is_available: true },
    { name: 'Veg Grilled Paneer Burger Combo', category: 'Grilled Burger', price: 189, type: 'veg', is_available: true },
    // GRILLED BURGER — Non Veg
    { name: 'Chicken Seekh Burger', category: 'Grilled Burger', price: 89, type: 'non-veg', is_available: true },
    { name: 'Chicken Seekh Burger Combo', category: 'Grilled Burger', price: 189, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Coleslaw Burger', category: 'Grilled Burger', price: 99, type: 'non-veg', is_available: true },
    { name: 'Chicken Salami Coleslaw Burger Combo', category: 'Grilled Burger', price: 199, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Burger', category: 'Grilled Burger', price: 109, type: 'non-veg', is_available: true },
    { name: 'Chicken Roasted Burger Combo', category: 'Grilled Burger', price: 209, type: 'non-veg', is_available: true },

    // MOMOS
    { name: 'Veg Steamed Momos (4 pcs)', category: 'Momos', price: 59, type: 'veg', is_available: true },
    { name: 'Veg Steamed Momos (8 pcs)', category: 'Momos', price: 109, type: 'veg', is_available: true },
    { name: 'Veg Fried Momos (4 pcs)', category: 'Momos', price: 69, type: 'veg', is_available: true },
    { name: 'Veg Fried Momos (8 pcs)', category: 'Momos', price: 139, type: 'veg', is_available: true },
    { name: 'Veg Tandoori Momos (4 pcs)', category: 'Momos', price: 79, type: 'veg', is_available: true },
    { name: 'Veg Tandoori Momos (8 pcs)', category: 'Momos', price: 159, type: 'veg', is_available: true },
    { name: 'Paneer Steamed Momos (4 pcs)', category: 'Momos', price: 69, type: 'veg', is_available: true },
    { name: 'Paneer Steamed Momos (8 pcs)', category: 'Momos', price: 139, type: 'veg', is_available: true },
    { name: 'Paneer Fried Momos (4 pcs)', category: 'Momos', price: 79, type: 'veg', is_available: true },
    { name: 'Paneer Fried Momos (8 pcs)', category: 'Momos', price: 159, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Momos (4 pcs)', category: 'Momos', price: 89, type: 'veg', is_available: true },
    { name: 'Paneer Tandoori Momos (8 pcs)', category: 'Momos', price: 179, type: 'veg', is_available: true },
    { name: 'Chicken Steamed Momos (4 pcs)', category: 'Momos', price: 79, type: 'non-veg', is_available: true },
    { name: 'Chicken Steamed Momos (8 pcs)', category: 'Momos', price: 159, type: 'non-veg', is_available: true },
    { name: 'Chicken Fried Momos (8 pcs)', category: 'Momos', price: 159, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Momos (4 pcs)', category: 'Momos', price: 99, type: 'non-veg', is_available: true },
    { name: 'Chicken Tandoori Momos (8 pcs)', category: 'Momos', price: 189, type: 'non-veg', is_available: true },

    // FRENCH FRIES
    { name: 'French Fries (Small)', category: 'French Fries', price: 79, type: 'veg', is_available: true },
    { name: 'French Fries (Large)', category: 'French Fries', price: 99, type: 'veg', is_available: true },
    { name: 'Piri Piri French Fries (Small)', category: 'French Fries', price: 89, type: 'veg', is_available: true },
    { name: 'Piri Piri French Fries (Large)', category: 'French Fries', price: 109, type: 'veg', is_available: true },
    { name: 'Cheese French Fries (Small)', category: 'French Fries', price: 89, type: 'veg', is_available: true },
    { name: 'Cheese French Fries (Large)', category: 'French Fries', price: 109, type: 'veg', is_available: true },

    // GARLIC BREAD
    { name: 'Cheese Garlic Bread', category: 'Garlic Bread', price: 99, type: 'veg', is_available: true },
    { name: 'Cheese Garlic Bread (with Vegetable)', category: 'Garlic Bread', price: 109, type: 'veg', is_available: true },
    { name: 'Cheese Garlic Bread (with Jalapeno)', category: 'Garlic Bread', price: 109, type: 'veg', is_available: true },
    { name: 'Chicken Cheese Garlic Bread', category: 'Garlic Bread', price: 119, type: 'non-veg', is_available: true },

    // STARTER
    { name: 'Chilli Potato', category: 'Starter', price: 99, type: 'veg', is_available: true },
    { name: 'Honey Chilli Potato', category: 'Starter', price: 119, type: 'veg', is_available: true },

    // WRAP ROLL
    { name: 'Potato Wrap', category: 'Wrap Roll', price: 99, type: 'veg', is_available: true },
    { name: 'Paneer Wrap', category: 'Wrap Roll', price: 129, type: 'veg', is_available: true },
    { name: 'Chicken Seekh Wrap', category: 'Wrap Roll', price: 129, type: 'non-veg', is_available: true },

    // KULCHA
    { name: 'Stuffed Kulcha', category: 'Kulcha', price: 119, type: 'veg', is_available: true },
    { name: 'Paneer Kulcha', category: 'Kulcha', price: 129, type: 'veg', is_available: true },
    { name: 'Chicken Kulcha', category: 'Kulcha', price: 149, type: 'non-veg', is_available: true },

    // MAGGI
    { name: 'Plain Maggi', category: 'Maggi', price: 49, type: 'veg', is_available: true },
    { name: 'Veg Maggi', category: 'Maggi', price: 59, type: 'veg', is_available: true },
    { name: 'Chicken Maggi', category: 'Maggi', price: 79, type: 'non-veg', is_available: true },

    // SHAKES
    { name: 'Vanila Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Vanila Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Strawberry Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Strawberry Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Chocolate Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Chocolate Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Pineapple Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Pineapple Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Butterscotch Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Butterscotch Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Kesar Pista Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Kesar Pista Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Oreo Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Oreo Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Kitkat Shake', category: 'Shakes', price: 99, type: 'veg', is_available: true },
    { name: 'Kitkat Shake (with Ice Cream)', category: 'Shakes', price: 119, type: 'veg', is_available: true },
    { name: 'Cold Coffee', category: 'Shakes', price: 109, type: 'veg', is_available: true },
    { name: 'Cold Coffee (with Ice Cream)', category: 'Shakes', price: 129, type: 'veg', is_available: true },

    // ICE CREAM
    { name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 59, type: 'veg', is_available: true },
    { name: 'Strawberry Ice Cream', category: 'Ice Cream', price: 59, type: 'veg', is_available: true },
    { name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 59, type: 'veg', is_available: true },
    { name: 'Butterscotch Ice Cream', category: 'Ice Cream', price: 69, type: 'veg', is_available: true },
    { name: 'Kesar Pista Ice Cream', category: 'Ice Cream', price: 69, type: 'veg', is_available: true },

    // KULFI
    { name: 'Kesar Pista Kulfi', category: 'Kulfi', price: 49, type: 'veg', is_available: true },
    { name: 'Chocolate Kulfi', category: 'Kulfi', price: 49, type: 'veg', is_available: true },
    { name: 'Chocobar Kulfi', category: 'Kulfi', price: 49, type: 'veg', is_available: true },
    { name: 'Mango Kulfi', category: 'Kulfi', price: 49, type: 'veg', is_available: true },
    { name: 'Pan Kulfi', category: 'Kulfi', price: 49, type: 'veg', is_available: true },

    // BEVERAGES
    { name: 'Mojito', category: 'Beverages', price: 99, type: 'veg', is_available: true },
    { name: 'Fruit Beer', category: 'Beverages', price: 69, type: 'veg', is_available: true },
    { name: 'Ice Tea', category: 'Beverages', price: 99, type: 'veg', is_available: true },
    { name: 'Fresh Lime Soda', category: 'Beverages', price: 69, type: 'veg', is_available: true },
    { name: 'Hot Coffee (Small)', category: 'Beverages', price: 59, type: 'veg', is_available: true },
    { name: 'Hot Coffee (Large)', category: 'Beverages', price: 69, type: 'veg', is_available: true },
    { name: 'Tea', category: 'Beverages', price: 29, type: 'veg', is_available: true },
    { name: 'Kulhad Tea', category: 'Beverages', price: 49, type: 'veg', is_available: true },
];

const seedMenu = async () => {
    try {
        const menu = db.collection('menu');
        const count = await menu.countDocuments();
        const target = GRILLZ_POINT_MENU.length;

        if (count === target) {
            console.log(`📊 Menu in sync (${target} items).`);
            return;
        }

        console.log(`☁️ Reseeding menu — found ${count}, target ${target}...`);
        if (count > 0) {
            await menu.deleteMany({});
            console.log(`🗑️  Cleared ${count} stale rows.`);
        }
        await menu.insertMany(GRILLZ_POINT_MENU);
        console.log(`✅ Seeded ${target} Grillz Point items.`);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
    }
};

const ensureIndexes = async () => {
    try {
        await db.collection('orders').createIndex({ created_at: -1 });
        await db.collection('orders').createIndex({ user_email: 1, created_at: -1 });
        await db.collection('orders').createIndex({ status: 1 });
    } catch (err) {
        console.error("Index error:", err.message);
    }
};

module.exports = { connectDB, getDB, seedMenu, ensureIndexes };
