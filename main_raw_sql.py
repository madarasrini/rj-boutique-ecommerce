import sqlite3
from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
import auth
import os

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# --- Database Connection ---
def get_db_connection():
    conn = sqlite3.connect('ecommerce_raw.db')
    conn.row_factory = sqlite3.Row # Returns dict-like rows
    return conn

# --- Initialize Database Schema (Raw SQL) ---
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 2. Categories Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        )
    ''')

    # 3. Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 100,
            image_url TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    ''')

    # 4. Cart Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id),
            UNIQUE(user_id, product_id)
        )
    ''')

    # 5. Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            shipping_address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Seed Admin User
    cursor.execute("SELECT id FROM users WHERE email = 'admin@rjai.com'")
    if not cursor.fetchone():
        hashed_pwd = auth.get_password_hash("admin123")
        cursor.execute(
            "INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?)",
            ("admin@rjai.com", hashed_pwd, "System Admin", 1)
        )

    # Seed Products
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()['count'] == 0:
        cursor.execute("INSERT INTO categories (name, description) VALUES ('Electronics', 'Gadgets')")
        cat_id = cursor.lastrowid
        cursor.execute(
            "INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)",
            (cat_id, "Sony WH-1000XM5", "Noise Cancelling Headphones", 29990.0, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80")
        )

    conn.commit()
    conn.close()

init_db()

# --- Dependency to get current user ---
async def get_current_user_raw(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        token = token.replace("Bearer ", "")
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            return None
    except auth.JWTError:
        return None
        
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return user

# --- Routes (Raw SQL) ---

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, user: dict = Depends(get_current_user_raw)):
    conn = get_db_connection()
    # SQL JOIN to get products with category names
    products = conn.execute('''
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
    ''').fetchall()
    conn.close()
    return templates.TemplateResponse("index.html", {"request": request, "products": products, "user": user})

@app.post("/cart/add/{product_id}")
async def add_to_cart(product_id: int, user: dict = Depends(get_current_user_raw)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if item already in cart
    cursor.execute("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?", (user['id'], product_id))
    existing_item = cursor.fetchone()
    
    if existing_item:
        # UPDATE Query
        cursor.execute("UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?", (existing_item['id'],))
    else:
        # INSERT Query
        cursor.execute("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)", (user['id'], product_id))
        
    conn.commit()
    conn.close()
    return RedirectResponse(url="/cart", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/cart", response_class=HTMLResponse)
async def view_cart(request: Request, user: dict = Depends(get_current_user_raw)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    
    conn = get_db_connection()
    # Complex JOIN to get cart items with product details
    cart_items = conn.execute('''
        SELECT c.quantity, p.name, p.price, p.image_url, (c.quantity * p.price) as subtotal
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ''', (user['id'],)).fetchall()
    
    total = sum(item['subtotal'] for item in cart_items)
    conn.close()
    
    return templates.TemplateResponse("cart.html", {"request": request, "cart_items": cart_items, "total": total, "user": user})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
