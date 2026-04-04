const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'luxe_eatery_PROD.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT DEFAULT 'veg', -- veg or non-veg
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    table_number INTEGER NOT NULL,
    token_number TEXT NOT NULL,
    items TEXT NOT NULL, -- JSON string
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, ready, completed
    payment_ref TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Seed function
const seedMenu = () => {
  const count = db.prepare('SELECT count(*) as count FROM menu').get();
  if (count.count === 0) {
    const items = [
      // SOUP SPECIAL
      { name: 'Veg. Manchow Soup', description: 'Spicy and sour with crispy noodles', price: 110, category: 'Soup Special', type: 'veg' },
      { name: 'Veg. Lemon Coriander Soup', description: 'Light refreshing lemon broth', price: 110, category: 'Soup Special', type: 'veg' },
      { name: 'Chicken Hot N Sour Soup', description: 'Spicy shredded chicken in thick broth', price: 140, category: 'Soup Special', type: 'non-veg' },
      { name: 'Chicken Clear Soup', description: 'Lean chicken in nutritious clear broth', price: 140, category: 'Soup Special', type: 'non-veg' },
      
      // VEG. TANDOORI STARTER
      { name: 'Pahadi Soya Chaap', description: 'Marinated in mountain herbs', price: 260, category: 'Veg. Tandoori', type: 'veg' },
      { name: 'Hara Bhara Kabab', description: 'Spinach and pea nutritious kababs', price: 260, category: 'Veg. Tandoori', type: 'veg' },
      { name: 'Mushroom Tikka', description: 'Clay oven roasted mushrooms', price: 280, category: 'Veg. Tandoori', type: 'veg' },
      { name: 'Soya Chaap Roll', description: 'Grilled chaap wrapped in rumali', price: 160, category: 'Veg. Tandoori', type: 'veg' },

      // CHICKEN STARTERS (CHINESE)
      { name: 'Crispy Honey Chicken', description: 'Sweet and crunchy appetizers', price: 280, category: 'Chicken Starters', type: 'non-veg' },
      { name: 'Chilli Chicken (Dry)', description: 'Tossed with peppers and onions', price: 320, category: 'Chicken Starters', type: 'non-veg' },
      { name: 'Drums of Heaven (8 pcs)', description: 'Classic chicken lollipops in sauce', price: 350, category: 'Chicken Starters', type: 'non-veg' },
      { name: 'Chicken Hongkong', description: 'Traditional spicy Hongkong style', price: 320, category: 'Chicken Starters', type: 'non-veg' },

      // TANDOORI MOMO
      { name: 'Veg. Malai Momo', description: 'Creamy tandoori vegetable momos', price: 160, category: 'Tandoori Momo', type: 'veg' },
      { name: 'Paneer Achari Momo', description: 'Pickle-flavoured tandoori paneer momos', price: 180, category: 'Tandoori Momo', type: 'veg' },
      { name: 'Chk. Afghani Momo', description: 'Cashew-marinated chicken tandoori momos', price: 180, category: 'Tandoori Momo', type: 'non-veg' },

      // PANEER TIKKA & CHAAP
      { name: 'Paneer Tikka', description: 'Traditional clay oven grilled paneer', price: 200, category: 'Tandoori Mains', type: 'veg' },
      { name: 'Afghani Paneer Tikka', description: 'Mild and creamy grilled paneer', price: 220, category: 'Tandoori Mains', type: 'veg' },
      { name: 'Malai Chaap', description: 'Soy chaap marinated in rich cream', price: 190, category: 'Tandoori Mains', type: 'veg' },
      { name: 'Butter Malai Chaap', description: 'Extra buttery soy chaap grill', price: 200, category: 'Tandoori Mains', type: 'veg' },

      // NON-VEG. TANDOORI STARTER
      { name: 'Chicken Seekh Kabab', description: 'Minced chicken skewers', price: 280, category: 'Non-Veg Tandoori', type: 'non-veg' },
      { name: 'Chicken Tikka', description: 'Classic red marinated chicken grill', price: 350, category: 'Non-Veg Tandoori', type: 'non-veg' },
      { name: 'Tandoori Leg (Full)', description: 'Succulent chicken leg joint', price: 280, category: 'Non-Veg Tandoori', type: 'non-veg' },

      // NOODLES
      { name: 'Veg. Noodles', description: 'Classic stir-fried thin noodles', price: 140, category: 'Noodles', type: 'veg' },
      { name: 'Hakka Noodles', description: 'Traditional street-style dry noodles', price: 150, category: 'Noodles', type: 'veg' },
      { name: 'Chilli Garlic Noodles', description: 'Burnt garlic and spicy finish', price: 150, category: 'Noodles', type: 'veg' },
      { name: 'Chk. Singapuri Noodles', description: 'Yellow-curry flavoured chicken noodles', price: 170, category: 'Noodles', type: 'non-veg' },

      // STEAM MOMO
      { name: 'Veg. Momo (8 pcs)', description: 'Classic steamed veg dumplings', price: 100, category: 'Steam Momo', type: 'veg' },
      { name: 'Paneer Momo (8 pcs)', description: 'Fresh paneer stuffed dumplings', price: 120, category: 'Steam Momo', type: 'veg' },
      { name: 'Chicken Momo (8 pcs)', description: 'Minced chicken stuffed dumplings', price: 120, category: 'Steam Momo', type: 'non-veg' },

      // KC CRUNCHY
      { name: 'Crunchy Veg. Momo', description: 'Coated and deep-fried veg momos', price: 160, category: 'KC Special', type: 'veg' },
      { name: 'Corn Cheese Burst Momo', description: 'Stuffed with sweet corn and melting cheese', price: 180, category: 'KC Special', type: 'veg' },
      { name: 'Crunchy Wings', description: 'Crispy breaded chicken wings', price: 300, category: 'KC Special', type: 'non-veg' },
      { name: 'Veg. Pizza Momo', description: 'Pizza flavoured stuffing', price: 180, category: 'KC Special', type: 'veg' }
    ];

    const insert = db.prepare('INSERT INTO menu (name, description, price, category, type) VALUES (?, ?, ?, ?, ?)');
    items.forEach(item => {
      insert.run(item.name, item.description, item.price, item.category, item.type);
    });

    // Default admin: admin/admin123
    db.prepare('INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)').run('admin', 'admin123');
  }
};

seedMenu();

module.exports = db;
