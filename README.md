# Zorka Shop — Dynamic Full-Stack E-Commerce

A fully dynamic e-commerce application built on the Zorka HTML template, powered by Node.js, Express, and MongoDB. All product data is served from the database through a REST API. The admin panel allows full CRUD management of products.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + Express.js              |
| Database  | MongoDB + Mongoose                |
| Frontend  | Existing HTML/CSS + Vanilla JS    |
| Auth      | JWT (admin) + Express Session (cart) |
| Uploads   | Multer (local disk)               |

---

## Project Structure

```
zorka-app/
├── server/
│   ├── server.js              # Main Express app + startup
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Product.js         # Product schema
│   │   └── Admin.js           # Admin schema (bcrypt passwords)
│   ├── routes/
│   │   ├── productRoutes.js   # GET/POST/PUT/DELETE /api/products
│   │   ├── cartRoutes.js      # Cart via session
│   │   └── authRoutes.js      # Admin login/logout
│   └── middleware/
│       └── auth.js            # JWT protect middleware
├── public/                    # All original HTML, CSS, JS assets
│   └── assets/scripts/
│       ├── cart.js            # Cart badge + addToCart()
│       ├── products.js        # Dynamic product grid rendering
│       ├── single-product.js  # Single product page loader
│       └── shopping-cart-page.js  # Cart page renderer
├── admin/                     # Admin panel (login-protected)
│   ├── login.html
│   ├── dashboard.html
│   ├── products.html
│   ├── add-product.html
│   ├── edit-product.html
│   ├── admin.css
│   └── admin-auth.js
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup Instructions

### 1. Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** running locally on port 27017  
  → Install: https://www.mongodb.com/try/download/community  
  → Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

### 2. Install Dependencies

```bash
cd zorka-app
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` as needed:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/zorka_shop
SESSION_SECRET=your_random_secret_here
JWT_SECRET=your_jwt_secret_here
```

For **MongoDB Atlas**, replace MONGO_URI with your connection string:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/zorka_shop
```

### 4. Run the App

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Visit: **http://localhost:3000**

---

## Admin Panel

URL: **http://localhost:3000/admin**

**Default credentials** (created automatically on first run):
- Username: `admin`
- Password: `admin123`

> ⚠️ Change these credentials after first login in production.

### Admin Features
- **Dashboard** — product stats overview
- **Products** — view, search, filter by category, delete
- **Add Product** — upload images, set price, category, stock, badge
- **Edit Product** — update any field, manage images

---

## API Reference

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All active products |
| GET | `/api/products?category=Jackets` | Filter by category |
| GET | `/api/products?sort=price_asc` | Sort by price |
| GET | `/api/products/:id` | Single product |

### Products (Admin — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product (multipart/form-data) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Cart (Session-based)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart with enriched product data |
| POST | `/api/cart/add` | Add item `{ productId, quantity }` |
| POST | `/api/cart/remove` | Remove item `{ productId }` |
| POST | `/api/cart/update` | Update quantity `{ productId, quantity }` |
| POST | `/api/cart/clear` | Empty the cart |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | `{ username, password }` → returns JWT token |

---

## How Dynamic Loading Works

### Shop Pages (`shop-fullwidth.html`, `shop-with-sidebar.html`)
Static product HTML has been removed. On page load, `products.js` fetches `/api/products`, builds product card HTML matching the original template's classes, and injects it into `.box-product.row`.

### Single Product (`single-product.html`)
`single-product.js` reads the `?id=` query param, fetches `/api/products/:id`, and populates the page's name, price, description, images, and stock fields.

### Shopping Cart (`shopping-cart.html`)
`shopping-cart-page.js` fetches `/api/cart`, renders cart rows into the existing table, and handles quantity changes + item removal via API calls.

### Cart Count Badge
`cart.js` updates the `<span>` inside `.top-cart > a` on every page load, keeping the header count in sync with the session cart.

---

## Adding Sample Products

After starting the server, add products via the admin panel at `/admin`, or via API:

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Copy the token from the response

curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Handmade Flared Jacket",
    "price": 189.99,
    "category": "Jackets",
    "stock": 15,
    "description": "Premium handmade jacket with flared design.",
    "badge": "new"
  }'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Make sure MongoDB is running: `mongod` or check Atlas URI |
| Products not showing on shop page | Check browser console for API errors; verify server is running |
| Admin login fails | Default is `admin` / `admin123`; check MongoDB is connected |
| Images not displaying | Ensure `public/uploads/` directory exists (auto-created on start) |
| Port 3000 in use | Change `PORT` in `.env` |
