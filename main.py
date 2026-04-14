from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import models, database, auth
from database import engine, get_db
import os

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Templates
templates = Jinja2Templates(directory="templates")

# Seed Data
def seed_db(db: Session):
    if db.query(models.Category).count() == 0:
        electronics = models.Category(name="Electronics", description="Gadgets and devices")
        home = models.Category(name="Home", description="Furniture and decor")
        fashion = models.Category(name="Fashion", description="Clothing and accessories")
        books = models.Category(name="Books", description="Literature and educational")
        db.add_all([electronics, home, fashion, books])
        db.commit()

        # Seed Products
        p1 = models.Product(
            name="Sony WH-1000XM5", 
            description="Noise Cancelling Headphones", 
            price=29990.0, 
            image_url="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
            category_id=electronics.id
        )
        p2 = models.Product(
            name="iPhone 15 Pro", 
            description="Titanium design", 
            price=148900.0, 
            image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
            category_id=electronics.id
        )
        db.add_all([p1, p2])
        db.commit()

    if db.query(models.User).filter(models.User.email == "admin@rjai.com").count() == 0:
        admin = models.User(
            email="admin@rjai.com",
            password_hash=auth.get_password_hash("admin123"),
            full_name="System Admin",
            is_admin=True
        )
        db.add(admin)
        db.commit()

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_db(db)

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    products = db.query(models.Product).all()
    return templates.TemplateResponse("index.html", {"request": request, "products": products, "user": current_user})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(password, user.password_hash):
        return RedirectResponse(url="/login?error=Invalid credentials", status_code=status.HTTP_303_SEE_OTHER)
    
    access_token = auth.create_access_token(data={"sub": user.email})
    response = RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)
    return response

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/")
    response.delete_cookie("access_token")
    return response

@app.get("/product/{product_id}", response_class=HTMLResponse)
async def product_detail(request: Request, product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return templates.TemplateResponse("product.html", {"request": request, "product": product, "user": current_user})

@app.post("/cart/add/{product_id}")
async def add_to_cart(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user:
        return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    
    cart_item = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id, models.CartItem.product_id == product_id).first()
    if cart_item:
        cart_item.quantity += 1
    else:
        cart_item = models.CartItem(user_id=current_user.id, product_id=product_id, quantity=1)
        db.add(cart_item)
    db.commit()
    return RedirectResponse(url="/cart", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/cart", response_class=HTMLResponse)
async def view_cart(request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user:
        return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    total = sum(item.product.price * item.quantity for item in cart_items)
    return templates.TemplateResponse("cart.html", {"request": request, "cart_items": cart_items, "total": total, "user": current_user})

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    total_users = db.query(models.User).count()
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(models.Order).with_entities(models.func.sum(models.Order.total_amount)).scalar() or 0
    products = db.query(models.Product).all()
    return templates.TemplateResponse("admin.html", {
        "request": request, 
        "user": admin,
        "stats": {"users": total_users, "orders": total_orders, "revenue": total_revenue},
        "products": products
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
