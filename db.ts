import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('ecommerce.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    is_admin INTEGER DEFAULT 0,
    blocked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    discount_price REAL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 100,
    variants TEXT,
    embeddings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    provider TEXT,
    last4 TEXT,
    upi_id TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Seed initial products if none exist
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, discount_price, image_url, category, variants)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProducts = [
    // ELECTRONICS
    ['Sony WH-1000XM5 Noise Cancelling Headphones', 'Industry-leading noise cancellation with two processors controlling 8 microphones.', 34990.00, 29990.00, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80', 'Electronics', JSON.stringify([
      { id: 'v1', name: 'Black', image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80', price_override: null },
      { id: 'v2', name: 'Silver', image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', price_override: null },
      { id: 'v3', name: 'Midnight Blue', image_url: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&q=80', price_override: null }
    ])],
    ['iPhone 15 Pro Max (256GB, Titanium)', 'Forged in titanium and featuring the groundbreaking A17 Pro chip.', 159900.00, 148900.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', 'Electronics', JSON.stringify([
      { id: 'v1', name: 'Natural Titanium', image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', price_override: null },
      { id: 'v2', name: 'Blue Titanium', image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', price_override: null }
    ])],
    ['Samsung Galaxy S24 Ultra (5G, 256GB)', 'The ultimate Galaxy Ultra experience with Galaxy AI and S Pen.', 129999.00, 119999.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 'Electronics', null],
    ['Sony Alpha 7 IV Full-frame Mirrorless Camera', '33MP Exmor R CMOS sensor with advanced BIONZ XR processor.', 242490.00, 218990.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Electronics', null],
    ['Apple AirPods Pro (2nd Generation) with USB-C', 'Up to 2x more Active Noise Cancellation than the previous generation.', 24900.00, 22900.00, 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=800&q=80', 'Electronics', null],
    ['Dell UltraSharp 32 4K USB-C Hub Monitor', 'Experience 4K resolution and exceptional color with IPS Black technology.', 89900.00, 79900.00, 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80', 'Electronics', null],
    ['Logitech MX Master 3S Wireless Mouse', 'Iconic quiet click mouse with 8K DPI tracking on any surface.', 10995.00, 9495.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 'Electronics', null],
    ['Keychron Q6 Max QMK Custom Mechanical Keyboard', 'A full-size 100% layout wireless mechanical keyboard with aluminum body.', 18999.00, 16999.00, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', 'Electronics', null],

    // HOME
    ['Dyson V15 Detect Cordless Vacuum', 'The most powerful, intelligent cordless vacuum with laser illumination.', 65900.00, 59900.00, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80', 'Home', null],
    ['Philips Hue White & Color Ambiance Starter Kit', 'Smart lighting with millions of colors and voice control.', 14999.00, 12999.00, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80', 'Home', null],
    ['Herman Miller Aeron Ergonomic Chair', 'The gold standard in ergonomic seating for office comfort.', 145000.00, 135000.00, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80', 'Home', null],
    ['Marshall Stanmore III Bluetooth Speaker', 'Iconic design with room-filling sound and Bluetooth 5.2.', 41999.00, 36999.00, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80', 'Home', null],
    ['Casper Original Foam Mattress (Queen)', 'Engineered for support and cooling with Zoned Support.', 85000.00, 75000.00, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 'Home', null],
    ['Lovesac Sactional (2 Seats + 4 Sides)', 'The world’s most adaptable couch with washable covers.', 245000.00, 225000.00, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', 'Home', null],

    // FASHION
    ['Tumi Alpha 3 Brief Pack', 'Versatile and durable backpack for business and travel.', 54000.00, 48000.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Fashion', null],
    ['Canada Goose Expedition Parka', 'The original extreme weather parka, developed for scientists in Antarctica.', 125000.00, 115000.00, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 'Fashion', null],
    ['Omega Speedmaster Moonwatch Professional', 'One of the world’s most iconic timepieces, worn on all six lunar missions.', 645000.00, 615000.00, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', 'Fashion', null],
    ['Gucci Double G Leather Belt', 'A signature accessory featuring the iconic interlocking G buckle.', 42000.00, 38000.00, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80', 'Fashion', null],
    ['Common Projects Original Achilles Low', 'Minimalist luxury sneakers handcrafted in Italy from premium leather.', 38000.00, 34000.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 'Fashion', null],
    ['Barbour Classic Beaufort Wax Jacket', 'Iconic waxed cotton jacket with a corduroy collar and tartan lining.', 32000.00, 28000.00, 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80', 'Fashion', null],
    ['Rimowa Original Cabin Suitcase', 'The iconic aluminum suitcase with its distinctive grooves.', 115000.00, 105000.00, 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&q=80', 'Fashion', null],
    ['Acne Studios Canada Oversized Scarf', 'Luxuriously soft wool scarf with fringed edges.', 18000.00, 16000.00, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80', 'Fashion', null],

    // BOOKS
    ['Clean Code: A Handbook of Agile Software Craftsmanship', 'A must-read for any developer looking to write better code by Robert C. Martin.', 3800.00, 3200.00, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80', 'Books', null],
    ['The Pragmatic Programmer (20th Anniversary Edition)', 'One of the most significant books in the field of software development.', 4200.00, 3600.00, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80', 'Books', null],
    ['Design Patterns: Elements of Reusable Object-Oriented Software', 'The classic book on software design patterns by the Gang of Four.', 5500.00, 4800.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'Books', null],
    ['The Art of Computer Programming (Box Set)', 'Donald Knuth’s multi-volume work on the analysis of algorithms.', 18500.00, 16500.00, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80', 'Books', null],
    ['Principles: Life and Work (Ray Dalio)', 'Unconventional principles for life and business from a legendary investor.', 2800.00, 2200.00, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80', 'Books', null],
    ['Zero to One (Peter Thiel)', 'Notes on startups, or how to build the future.', 950.00, 750.00, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80', 'Books', null],
    ['The Intelligent Investor (Benjamin Graham)', 'The definitive book on value investing.', 1100.00, 850.00, 'https://images.unsplash.com/photo-1592492159418-39f319320569?w=800&q=80', 'Books', null],
    ['Deep Work (Cal Newport)', 'Rules for focused success in a distracted world.', 850.00, 650.00, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80', 'Books', null],
    ['The Lean Startup (Eric Ries)', 'How today’s entrepreneurs use continuous innovation to create successful businesses.', 950.00, 750.00, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', 'Books', null]
  ];

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p);
    }
  });

  insertMany(initialProducts);
}

// Seed admin user
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@rjai.com');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, 1)')
    .run('admin@rjai.com', hashedPassword, 'System Admin');
  console.log('Admin user seeded: admin@rjai.com / admin123');
}

export default db;
