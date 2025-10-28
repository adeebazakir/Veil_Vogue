# 📚 Veil & Vogue - Complete Project Guide

## 🎯 **Project Overview**

**Veil & Vogue** is a full-stack e-commerce web application for selling traditional clothing (Abayas, Suits, Hijabs, etc.) with a unique **custom measurement** feature.

### **Technology Stack:**
- **Frontend**: React.js (with Vite), Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Cloud Storage**: Cloudinary (for images)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt

### **User Roles:**
1. **Customer** - Browse, buy, add custom measurements
2. **Seller** - Upload and manage products
3. **Admin** - Verify products, manage users

---

## 📁 **Project Structure**

```
V_V_code/
├── backend/                 ← Server-side application
│   ├── config/             ← Configuration files
│   ├── controllers/        ← Business logic
│   ├── middleware/         ← Authentication & validation
│   ├── models/            ← Database schemas
│   ├── routes/            ← API endpoints
│   ├── .env               ← Environment variables (secrets)
│   ├── .gitignore         ← Files to ignore in git
│   ├── package.json       ← Backend dependencies
│   └── server.js          ← Main entry point
│
├── frontend/               ← Client-side application
│   ├── public/            ← Static assets
│   ├── src/               ← React source code
│   │   ├── components/    ← Reusable UI components
│   │   ├── config/        ← Frontend configuration
│   │   ├── pages/         ← Full page components
│   │   └── [Screen files] ← Major application screens
│   ├── index.html         ← HTML entry point
│   ├── package.json       ← Frontend dependencies
│   └── vite.config.js     ← Vite build configuration
│
└── CLEANUP_SUMMARY.md     ← Documentation of cleanup
```

---

## 🔧 **BACKEND FILES EXPLAINED**

### **📂 backend/server.js** (Main Backend Entry Point)

**Purpose**: Starts the Express server, connects to MongoDB, and registers all routes.

**What it does:**
1. Loads environment variables from `.env` file
2. Creates Express application
3. Enables CORS (Cross-Origin Resource Sharing)
4. Connects to MongoDB database
5. Registers API routes:
   - `/api/users` - User authentication, registration, profile
   - `/api/products` - Product management
   - `/api/cart` - Shopping cart operations
   - `/api/orders` - Order management
   - `/api/upload` - Image uploads
   - `/api/reviews` - Product reviews
6. Sets up error handling middleware
7. Starts server on port 5000

**Key Code Flow:**
```javascript
Load .env → Create Express App → Enable CORS → Connect MongoDB 
→ Register Routes → Start Server on Port 5000
```

**How to run:**
```bash
cd backend
node server.js
# or
npm start
```

---

### **📂 backend/.env** (Environment Variables - NEVER COMMIT THIS!)

**Purpose**: Stores sensitive configuration data and secrets.

**Contents:**
```env
MONGO_URI=mongodb://localhost:27017/v_v_code
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

**Security**: This file is in `.gitignore` to prevent accidentally committing passwords/secrets to Git.

---

### **📂 backend/package.json** (Backend Dependencies)

**Purpose**: Lists all Node.js packages required for the backend.

**Key Dependencies:**
- `express`: Web framework for creating API
- `mongoose`: MongoDB object modeling (ORM)
- `bcryptjs`: Password hashing for security
- `jsonwebtoken`: For JWT authentication
- `cors`: Allows frontend to communicate with backend
- `dotenv`: Loads environment variables
- `cloudinary`: Image storage service
- `multer`: Handles file uploads
- `express-async-handler`: Simplifies error handling in async routes

**Scripts:**
```json
{
  "start": "node server.js",  // Starts the server
  "dev": "node server.js"     // Development mode
}
```

---

### **📂 backend/config/cloudinary.js** (Image Upload Configuration)

**Purpose**: Configures Cloudinary for storing product images in the cloud.

**What it does:**
1. **Configures Cloudinary** with API credentials from `.env`
2. **Sets up Multer Storage** to upload directly to Cloudinary
3. **Image Transformations**: Resizes/optimizes images
4. **Exports Functions**:
   - `uploadImage(file)` - Uploads image to Cloudinary
   - `deleteImage(publicId)` - Deletes image from Cloudinary

**Why Cloudinary?**
- Stores images in cloud (not on server)
- Automatic image optimization
- Fast CDN delivery
- Free tier available

**How it works:**
```
User uploads image → Multer processes → Cloudinary stores 
→ Returns URL → URL saved in MongoDB
```

---

## 📦 **BACKEND MODELS (Database Schemas)**

Models define the structure of data in MongoDB. Think of them as blueprints for your data.

### **📂 backend/models/userModel.js** (User Data Structure)

**Purpose**: Defines how user data is stored in the database.

**Schema Fields:**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (customer/seller/admin),
  address: String (optional),
  contact: String (optional)
}
```

**Special Features:**
1. **Pre-save Hook**: Automatically hashes password before saving
   ```javascript
   // When user.save() is called:
   "password123" → bcrypt → "$2a$10$Xy7..." (hashed)
   ```

2. **matchPassword Method**: Compares plain password with hashed password
   ```javascript
   user.matchPassword("password123") → true/false
   ```

**Why hash passwords?**
- If database is hacked, passwords are not readable
- bcrypt is one-way encryption (can't be decrypted)

---

### **📂 backend/models/productModel.js** (Product Data Structure)

**Purpose**: Defines product information structure.

**Schema Fields:**
```javascript
{
  seller: ObjectId (reference to User),
  name: String (required),
  price: Number (required),
  description: String,
  category: String (Abayas/Suits/Hijabs/Accessories),
  stock: Number (default: 0),
  images: [
    {
      url: String (Cloudinary URL),
      public_id: String (for deletion)
    }
  ],
  isVerified: Boolean (default: false),
  rating: Number (0-5),
  numReviews: Number
}
```

**Key Concepts:**
- `seller` field connects to User collection (relationship)
- `isVerified` controls if product appears on site
- `images` array allows multiple product images
- Admin must verify before product goes live

---

### **📂 backend/models/cartModel.js** (Shopping Cart Structure)

**Purpose**: Stores items a customer wants to buy.

**Schema Structure:**
```javascript
Cart {
  customer: ObjectId (reference to User),
  cartItems: [
    {
      product: ObjectId (reference to Product),
      name: String,
      price: Number,
      image: String (URL),
      quantity: Number,
      customization_details: String (JSON format),
      customization_cost: Number (₹150 if customized)
    }
  ]
}
```

**How it works:**
1. Each customer has ONE cart
2. Cart persists across sessions (saved in DB, not browser)
3. When "Add to Cart" is clicked:
   - If item exists, update quantity
   - If new item, add to cartItems array
4. Customization stored as JSON string:
   ```json
   {"bust":"36","length":"54","shoulder":"15"}
   ```

---

### **📂 backend/models/orderModel.js** (Order Structure)

**Purpose**: Records confirmed purchases.

**Schema Structure:**
```javascript
Order {
  customer: ObjectId (reference to User),
  orderItems: [
    {
      name: String,
      qty: Number,
      image: String,
      price: Number,
      product: ObjectId,
      customization_details: String,
      customization_cost: Number
    }
  ],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String (COD/Online),
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date
}
```

**Order Flow:**
```
Cart → Place Order → Order Created → Cart Cleared → Stock Reduced
```

---

### **📂 backend/models/reviewModel.js** (Review Structure)

**Purpose**: Stores customer product reviews.

**Schema Structure:**
```javascript
Review {
  customer: ObjectId (reference to User),
  product: ObjectId (reference to Product),
  rating: Number (1-5, required),
  title: String,
  comment: String
}
```

**Unique Constraint**: One review per customer per product.

---

## 🎮 **BACKEND CONTROLLERS (Business Logic)**

Controllers contain the actual logic for what happens when an API is called.

### **📂 backend/controllers/userController.js**

**Purpose**: Handles all user-related operations.

**Functions:**

#### 1. **registerUser** (POST /api/users/register)
```javascript
// What it does:
1. Receives: name, email, password, role, address, contact
2. Checks if user already exists
3. Creates new user (password auto-hashed by pre-save hook)
4. Generates JWT token
5. Returns user data + token
```

#### 2. **authUser** (POST /api/users/login)
```javascript
// Login process:
1. Receives: email, password
2. Finds user by email
3. Compares password using matchPassword()
4. If valid, generates JWT token
5. Returns user data + token
```

**JWT Token Structure:**
```
Token contains: { id: user._id }
Expires: 30 days
Frontend stores in localStorage
Sent in Authorization header for protected routes
```

#### 3. **updateUserProfile** (PUT /api/users/profile)
```javascript
// Updates user information
- Protected route (requires login)
- Updates: name, email, address, contact
- Returns updated user data
```

#### 4. **changePassword** (PUT /api/users/password)
```javascript
// Password change process:
1. Receives: currentPassword, newPassword
2. Validates input (min 6 characters)
3. Finds user by ID from JWT token
4. Verifies current password is correct
5. Updates to new password (auto-hashed)
6. Returns success message
```

#### 5. **getAdminStats** (GET /api/users/admin/stats)
```javascript
// Admin dashboard statistics:
- Total customers count
- Total sellers count
- Total admins count
- Total users count
- Protected: Admin only
```

#### 6. **getAllSellers** (GET /api/users/admin/sellers)
```javascript
// Returns list of all sellers
- Used in Admin Dashboard
- Protected: Admin only
```

#### 7. **getAllCustomers** (GET /api/users/admin/customers)
```javascript
// Returns list of all customers
- Used in Admin Dashboard
- Protected: Admin only
```

#### 8. **deleteUser** (DELETE /api/users/admin/:id)
```javascript
// Deletes a user (except admins)
- Protected: Admin only
- Cannot delete admin users
```

---

### **📂 backend/controllers/productController.js**

**Purpose**: Manages product CRUD operations.

**Functions:**

#### 1. **createProduct** (POST /api/products)
```javascript
// Seller creates new product:
1. Receives: name, price, description, category, stock, images
2. Sets seller to current user ID
3. Sets isVerified to false (needs admin approval)
4. Saves to database
5. Returns product data
```

#### 2. **getAllProducts** (GET /api/products)
```javascript
// Public route - shows verified products only
- Used on homepage, product pages
- Filters: isVerified = true
- Returns array of products
```

#### 3. **getProductById** (GET /api/products/:id)
```javascript
// Single product details:
- Returns full product info
- Includes seller information (populated)
- Used on product detail page
```

#### 4. **getSellerProducts** (GET /api/products/seller/all)
```javascript
// Seller's own products:
- Protected: Seller only
- Shows both verified and unverified
- Used in seller dashboard
```

#### 5. **getAllProductsAdmin** (GET /api/products/admin/all-products)
```javascript
// Admin views all products:
- Protected: Admin only
- Shows verified and unverified
- Includes seller info
- Used in admin dashboard
```

#### 6. **verifyProduct** (PUT /api/products/admin/verify/:id)
```javascript
// Admin verifies product:
- Sets isVerified to true
- Product becomes visible to customers
- Protected: Admin only
```

#### 7. **deleteProduct** (DELETE /api/products/:id)
```javascript
// Delete product:
- Admin can delete any product
- Seller can delete own products
- Deletes images from Cloudinary
```

#### 8. **updateProduct** (PUT /api/products/:id)
```javascript
// Update product details:
- Seller updates own product
- Fields: name, price, description, category, stock
```

---

### **📂 backend/controllers/cartController.js**

**Purpose**: Manages shopping cart operations.

**Functions:**

#### 1. **getCart** (GET /api/cart)
```javascript
// Fetches customer's cart:
1. Finds cart by customer ID
2. Calculates total (price + customization)
3. Returns cart items + total
```

#### 2. **addToCart** (POST /api/cart/add)
```javascript
// Add item to cart:
1. Receives: productId, quantity, customization_details
2. Checks if product exists and has stock
3. Parses customization_details JSON
4. If measurements provided, adds ₹150 charge
5. If item exists in cart, update quantity
6. If new item, add to cartItems array
7. Returns updated cart + total
```

**Customization Logic:**
```javascript
if (customization_details has actual values) {
  customization_cost = 150
} else {
  customization_cost = 0
}
```

#### 3. **removeFromCart** (DELETE /api/cart/:productId)
```javascript
// Remove item from cart:
- Filters out the product from cartItems
- Returns updated cart
```

#### 4. **updateCartQuantity** (PUT /api/cart/:productId)
```javascript
// Update item quantity:
- Receives new quantity
- Validates stock availability
- Updates quantity
- Returns updated cart
```

**Cart Total Calculation:**
```javascript
total = Σ (price × quantity) + (customization_cost × quantity)
```

---

### **📂 backend/controllers/orderController.js**

**Purpose**: Handles order placement and retrieval.

**Functions:**

#### 1. **addOrderItems** (POST /api/orders)
```javascript
// Place order:
1. Receives: shippingAddress, paymentMethod, prices
2. Gets cart items for customer
3. Creates order from cart items
4. Reduces product stock for each item
5. Clears customer's cart
6. Returns order confirmation
```

**Critical Stock Management:**
```javascript
For each cart item:
  product.stock -= item.quantity
  save product
```

#### 2. **getMyOrders** (GET /api/orders/myorders)
```javascript
// Customer's order history:
- Finds all orders by customer ID
- Sorted by date (newest first)
- Used in customer dashboard
```

#### 3. **getOrderById** (GET /api/orders/:id)
```javascript
// Single order details:
- Verifies customer owns the order
- Returns full order info
- Used in order confirmation page
```

#### 4. **updateOrderToPaid** (PUT /api/orders/:id/pay)
```javascript
// Mark order as paid:
- Sets isPaid = true
- Sets paidAt = current date
- Returns updated order
```

#### 5. **getSellerOrders** (GET /api/orders/seller/myorders)
```javascript
// Orders containing seller's products:
1. Gets all seller's products
2. Finds orders with those products
3. Filters to show only seller's items
4. Returns orders with customer info
```

---

### **📂 backend/controllers/reviewController.js**

**Purpose**: Manages product reviews.

**Functions:**
- **createReview**: Add review for product
- **getProductReviews**: Get all reviews for a product
- **getAllReviews**: Admin views all reviews

---

## 🛡️ **BACKEND MIDDLEWARE**

Middleware runs BEFORE the controller function. It's like a security checkpoint.

### **📂 backend/middleware/authMiddleware.js**

**Purpose**: Protects routes and checks user roles.

**Functions:**

#### 1. **protect** (Authentication Middleware)
```javascript
// How it works:
1. Check if Authorization header exists
2. Extract token: "Bearer xyz123..."
3. Verify token with JWT_SECRET
4. Decode token to get user ID
5. Fetch user from database
6. Attach user to req.user
7. If valid, call next() to proceed
8. If invalid, throw 401 Unauthorized error
```

**Usage:**
```javascript
router.get('/profile', protect, getUserProfile)
//                     ↑ Runs before getUserProfile
```

#### 2. **isSeller** (Role Check Middleware)
```javascript
// Checks if user is a seller:
if (req.user.role === 'seller') {
  next() // Allow access
} else {
  throw 403 Forbidden error
}
```

#### 3. **isAdmin** (Admin Check Middleware)
```javascript
// Checks if user is an admin:
if (req.user.role === 'admin') {
  next() // Allow access
} else {
  throw 403 Forbidden error
}
```

**Middleware Chain Example:**
```javascript
router.delete('/admin/:id', protect, isAdmin, deleteUser)
//                          1. Login?  2. Admin?  3. Execute
```

---

## 🛤️ **BACKEND ROUTES (API Endpoints)**

Routes define URL patterns and connect them to controllers.

### **📂 backend/routes/userRoutes.js**

**API Endpoints:**
```javascript
POST   /api/users/register           → registerUser
POST   /api/users/login              → authUser
PUT    /api/users/profile    🔒      → updateUserProfile
PUT    /api/users/password   🔒      → changePassword
GET    /api/users/admin/stats 🔒👑   → getAdminStats
GET    /api/users/admin/sellers 🔒👑 → getAllSellers
GET    /api/users/admin/customers 🔒👑 → getAllCustomers
DELETE /api/users/admin/:id 🔒👑    → deleteUser

Legend:
🔒 = Requires login (protect middleware)
👑 = Requires admin role (isAdmin middleware)
```

---

### **📂 backend/routes/productRoutes.js**

**API Endpoints:**
```javascript
POST   /api/products 🔒🏪              → createProduct
GET    /api/products                   → getAllProducts (verified only)
GET    /api/products/:id               → getProductById
GET    /api/products/seller/all 🔒🏪  → getSellerProducts
GET    /api/products/admin/all-products 🔒👑 → getAllProductsAdmin
PUT    /api/products/admin/verify/:id 🔒👑 → verifyProduct
PUT    /api/products/:id 🔒            → updateProduct
DELETE /api/products/:id 🔒            → deleteProduct

Legend:
🔒 = Requires login
🏪 = Requires seller role
👑 = Requires admin role
```

---

### **📂 backend/routes/cartRoutes.js**

**API Endpoints:**
```javascript
GET    /api/cart 🔒           → getCart
POST   /api/cart/add 🔒       → addToCart
DELETE /api/cart/:productId 🔒 → removeFromCart
PUT    /api/cart/:productId 🔒 → updateCartQuantity
```

---

### **📂 backend/routes/orderRoutes.js**

**API Endpoints:**
```javascript
POST   /api/orders 🔒               → addOrderItems (place order)
GET    /api/orders/myorders 🔒      → getMyOrders
GET    /api/orders/seller/myorders 🔒🏪 → getSellerOrders
GET    /api/orders/:id 🔒           → getOrderById
PUT    /api/orders/:id/pay 🔒       → updateOrderToPaid
```

---

### **📂 backend/routes/uploadRoutes.js**

**API Endpoints:**
```javascript
POST   /api/upload 🔒          → Upload image to Cloudinary
DELETE /api/upload/:publicId 🔒 → Delete image from Cloudinary
```

**Special Note:** Must come BEFORE `app.use(express.json())` in server.js to handle multipart/form-data.

---

### **📂 backend/routes/reviewRoutes.js**

**API Endpoints:**
```javascript
POST   /api/reviews 🔒           → createReview
GET    /api/reviews/:productId   → getProductReviews
GET    /api/reviews/admin/all 🔒👑 → getAllReviews
```

---

## 🎨 **FRONTEND FILES EXPLAINED**

### **📂 frontend/index.html** (HTML Entry Point)

**Purpose**: The single HTML file that loads the React app.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Veil & Vogue</title>
  </head>
  <body>
    <div id="root"></div> <!-- React renders here -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### **📂 frontend/package.json** (Frontend Dependencies)

**Key Dependencies:**
- `react`: UI library
- `react-dom`: Renders React to browser
- `react-router-dom`: Page navigation without reload
- `axios`: Makes HTTP requests to backend
- `tailwindcss`: Utility-first CSS framework
- `framer-motion`: Animations
- `react-slick`: Carousel/slider component

**Scripts:**
```json
{
  "dev": "vite",        // Start development server
  "build": "vite build", // Create production build
  "preview": "vite preview" // Preview production build
}
```

---

### **📂 frontend/vite.config.js** (Build Configuration)

**Purpose**: Configures Vite bundler.

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000  // Frontend runs on port 3000
  }
})
```

---

### **📂 frontend/tailwind.config.js** (Tailwind CSS Config)

**Purpose**: Customizes Tailwind CSS.

**Custom Colors, Fonts, Shadows:**
```javascript
theme: {
  extend: {
    colors: {
      primary: '#B799FF',  // Purple
      secondary: '#A080E0'
    },
    fontFamily: {
      sans: ['Inter', 'system-ui']
    }
  }
}
```

---

### **📂 frontend/src/main.jsx** (React Entry Point)

**Purpose**: Renders React app into HTML.

```javascript
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Flow:**
```
Browser loads index.html → Loads main.jsx → Renders App.jsx → Shows UI
```

---

### **📂 frontend/src/App.jsx** (Main Application Component)

**Purpose**: Defines all routes and page navigation.

**Route Structure:**
```javascript
<Router>
  <Header />  {/* Shows on every page */}
  <Routes>
    <Route path="/" element={<HomeScreen />} />
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/register" element={<RegisterScreen />} />
    <Route path="/profile" element={<ProfileScreen />} />
    <Route path="/cart" element={<CartScreen />} />
    <Route path="/product/:id" element={<ProductDetailScreen />} />
    <Route path="/shipping" element={<ShippingScreen />} />
    <Route path="/payment" element={<PaymentScreen />} />
    <Route path="/placeorder" element={<PlaceOrderScreen />} />
    <Route path="/order/:id" element={<OrderScreen />} />
    <Route path="/seller/products" element={<SellerProductScreen />} />
    <Route path="/seller/dashboard" element={<SellerDashboardNew />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/:category" element={<CategoryPage />} />
  </Routes>
  <Footer /> {/* Shows on every page */}
</Router>
```

**How React Router Works:**
- User clicks link → URL changes → React Router matches route → Renders component
- NO page reload (Single Page Application)

---

### **📂 frontend/src/index.css** (Global Styles)

**Purpose**: Global CSS styles for entire app.

**Contents:**
- Tailwind CSS imports
- Custom scrollbar styles
- Body padding for fixed navbar (90px)
- Custom animations (fadeIn, slideIn, etc.)
- Utility classes

**Important:**
```css
body {
  padding-top: 90px; /* Prevents content hiding under fixed navbar */
}
```

---

## 📄 **FRONTEND CONFIGURATION FILES**

### **📂 frontend/src/config/api.js**

**Purpose**: Centralized API configuration.

```javascript
export const API_BASE_URL = 'http://localhost:5000';

export const ENDPOINTS = {
  // User endpoints
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  profile: `${API_BASE_URL}/api/users/profile`,
  
  // Product endpoints
  products: `${API_BASE_URL}/api/products`,
  // ... more endpoints
};
```

**Why?** If backend URL changes, update in ONE place.

---

### **📂 frontend/src/config/customizationConfig.js**

**Purpose**: Defines measurement fields for different product categories.

```javascript
export const customizationConfig = {
  Suits: {
    title: 'Add Custom Measurements',
    icon: '🤵',
    fields: [
      { id: 'chest', label: 'Chest', unit: 'inches' },
      { id: 'waist', label: 'Waist', unit: 'inches' },
      { id: 'hips', label: 'Hips', unit: 'inches' },
      { id: 'shoulder', label: 'Shoulder Width', unit: 'inches' },
      { id: 'sleeveLength', label: 'Sleeve Length', unit: 'inches' },
      { id: 'length', label: 'Full Length', unit: 'inches' }
    ]
  },
  Abayas: {
    title: 'Add Custom Measurements',
    icon: '👘',
    fields: [
      { id: 'bust', label: 'Bust', unit: 'inches' },
      { id: 'shoulder', label: 'Shoulder Width', unit: 'inches' },
      { id: 'sleeveLength', label: 'Sleeve Length', unit: 'inches' },
      { id: 'length', label: 'Full Length', unit: 'inches' }
    ]
  }
  // Other categories don't have customization
};
```

**Usage:** `CustomizationForm` component reads this config to dynamically render fields.

---

## 🖼️ **FRONTEND SCREEN COMPONENTS**

### **📂 frontend/src/LoginScreen.jsx**

**Purpose**: User login page.

**What it does:**
1. Shows login form (email, password)
2. On submit, calls `POST /api/users/login`
3. If successful:
   - Stores user info + token in localStorage
   - Redirects based on role:
     - Customer → Homepage (/)
     - Seller → Seller Dashboard
     - Admin → Admin Dashboard
4. If failed, shows error message

**Key Code:**
```javascript
const loginHandler = async (e) => {
  e.preventDefault();
  const { data } = await axios.post('/api/users/login', { email, password });
  localStorage.setItem('userInfo', JSON.stringify(data));
  navigate(data.role === 'admin' ? '/admin/dashboard' : '/');
};
```

---

### **📂 frontend/src/RegisterScreen.jsx**

**Purpose**: User registration page.

**What it does:**
1. Shows registration form
2. User selects role (Customer/Seller)
3. On submit, calls `POST /api/users/register`
4. If successful, auto-login and redirect
5. Password validation (must match, min 6 chars)

---

### **📂 frontend/src/ProfileScreen.jsx** (Customer/Seller Dashboard)

**Purpose**: User profile management + seller features.

**Tabs:**

#### For All Users:
1. **Profile Tab**: Update name, email, address, contact
2. **Password Tab**: Change password
3. **Order History Tab** (Customers only): View past orders

#### For Sellers:
3. **Add Product Tab**: Link to product upload page
4. **My Products Tab**: View all uploaded products (verified/pending)
5. **Orders Tab**: View orders containing their products

**Key Features:**
- Edit product modal (inline editing)
- Refresh buttons for real-time updates
- Order customization display
- Product status badges (verified/pending)

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('profile');
const [sellerProducts, setSellerProducts] = useState([]);
const [customerOrders, setCustomerOrders] = useState([]);
// ... more states
```

**API Calls:**
- `fetchSellerProducts()` → GET /api/products/seller/all
- `fetchCustomerOrders()` → GET /api/orders/myorders
- `updateProfileHandler()` → PUT /api/users/profile
- `changePasswordHandler()` → PUT /api/users/password

---

### **📂 frontend/src/ProductScreen.jsx**

**Purpose**: Browse all products page.

**Features:**
- Grid layout of products
- Filters: Category, Price range, Stock status
- Search functionality
- "Add to Cart" buttons
- Responsive design

**API Call:**
```javascript
const fetchProducts = async () => {
  const { data } = await axios.get('/api/products');
  setProducts(data);
};
```

---

### **📂 frontend/src/ProductDetailScreen.jsx**

**Purpose**: Single product detail page.

**Features:**
- Image gallery (multiple images)
- Product info (name, price, description, stock)
- Category-specific customization form (Abayas/Suits)
- Add to cart with customization
- Customer reviews section
- Add review form
- Star ratings

**Customization Flow:**
```javascript
1. User enters measurements → CustomizationForm
2. Form calls onCustomizationChange(data)
3. Data stored in state
4. On "Add to Cart":
   - Convert to JSON string
   - Send to backend: { productId, quantity, customization_details }
5. Backend adds ₹150 charge if measurements provided
```

---

### **📂 frontend/src/CartScreen.jsx**

**Purpose**: Shopping cart page.

**Features:**
- List of cart items
- Item details: image, name, price, quantity
- Customization display (if any)
- Remove item button
- Quantity update
- Total price calculation
- Proceed to checkout button

**API Calls:**
```javascript
- GET /api/cart → Fetch cart
- DELETE /api/cart/:productId → Remove item
```

**Total Calculation:**
```javascript
total = items.reduce((sum, item) => 
  sum + (item.price + item.customization_cost) * item.quantity, 0
);
```

---

### **📂 frontend/src/ShippingScreen.jsx**

**Purpose**: Checkout step 1 - Shipping address.

**What it does:**
1. Shows form for shipping address
2. Saves to localStorage (persists across pages)
3. Navigates to payment page

**Data Stored:**
```javascript
{
  address: "123 Main St",
  city: "New York",
  postalCode: "10001",
  country: "USA"
}
```

---

### **📂 frontend/src/PaymentScreen.jsx**

**Purpose**: Checkout step 2 - Payment method.

**What it does:**
1. Shows payment options (COD, Online)
2. Saves selection to localStorage
3. Navigates to place order page

---

### **📂 frontend/src/PlaceOrderScreen.jsx**

**Purpose**: Checkout step 3 - Order review & confirmation.

**Features:**
- Review cart items
- Show shipping address
- Show payment method
- Price breakdown:
  - Items price
  - Customization charges
  - Shipping (FREE)
  - **Total**
- "Place Order" button

**On Place Order:**
```javascript
const placeOrderHandler = async () => {
  const { data } = await axios.post('/api/orders', {
    orderItems: cart.cartItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice: 0,  // FREE shipping
    totalPrice
  });
  navigate(`/order/${data._id}`);
};
```

---

### **📂 frontend/src/OrderScreen.jsx**

**Purpose**: Order confirmation page.

**Features:**
- Order ID
- Order items with customization
- Shipping address
- Payment status
- Total price
- Print/Download option

---

### **📂 frontend/src/SellerProductScreen.jsx**

**Purpose**: Seller uploads new products.

**Features:**
- Multi-step form
- Image upload (multiple images)
- Cloudinary integration
- Form validation
- Preview before submit

**Upload Flow:**
```javascript
1. Seller selects images
2. Images upload to Cloudinary
3. Get URLs from Cloudinary
4. Submit product data + URLs to backend
5. Product saved with isVerified = false
6. Seller sees "Pending verification" message
```

---

### **📂 frontend/src/SellerDashboardNew.jsx**

**Purpose**: Seller's main dashboard.

**Tabs:**
1. **Upload Products**: Add new products
2. **Verified Products**: View live products
3. **Orders**: See customer orders

**Features:**
- Order management
- Product statistics
- Revenue tracking
- Customer information
- Customization details display

---

### **📂 frontend/src/AdminDashboard.jsx**

**Purpose**: Admin control panel.

**Tabs:**
1. **Verify Products**: Approve/reject seller products
2. **View Customers**: List all customers
3. **View Sellers**: List all sellers

**Statistics Cards:**
- Total Products
- Total Customers
- Total Sellers
- Pending Products

**Features:**
- Product verification (one-click)
- Product deletion
- User deletion (customers/sellers only)
- Search/filter functionality

**API Calls:**
```javascript
- GET /api/products/admin/all-products
- GET /api/users/admin/customers
- GET /api/users/admin/sellers
- PUT /api/products/admin/verify/:id
- DELETE /api/products/:id
- DELETE /api/users/admin/:id
```

---

## 🧩 **FRONTEND REUSABLE COMPONENTS**

### **📂 frontend/src/components/Header.jsx**

**Purpose**: Contains the Navbar component.

---

### **📂 frontend/src/components/Navbar.jsx + Navbar.css**

**Purpose**: Top navigation bar (fixed).

**Features:**
- Logo (Veil & Vogue)
- Navigation links (Home, Abayas, Suits, Hijabs, Accessories)
- Cart icon with item count badge
- Profile dropdown (Login/Register or Profile/Logout)
- Responsive mobile menu

**Cart Count:**
```javascript
const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  const fetchCart = async () => {
    const { data } = await axios.get('/api/cart');
    setCartCount(data.cartItems?.length || 0);
  };
}, []);
```

**Styling:** `Navbar.css` with responsive design.

---

### **📂 frontend/src/components/Footer.jsx + Footer.css**

**Purpose**: Bottom footer.

**Contains:**
- Social media links
- Contact information
- Copyright notice
- Quick links

---

### **📂 frontend/src/components/Hero.jsx + Hero.css**

**Purpose**: Homepage hero section with product carousel.

**Features:**
- Fetches random verified products
- `react-slick` carousel
- Auto-play with 3-second interval
- Loading state (spinner)
- Click product → Navigate to detail page

**API Call:**
```javascript
const fetchRandomProducts = async () => {
  const { data } = await axios.get('/api/products');
  const randomProducts = data.sort(() => 0.5 - Math.random()).slice(0, 5);
  setProductImages(randomProducts);
};
```

---

### **📂 frontend/src/components/RandomProductsGrid.jsx + CSS**

**Purpose**: Grid of random products on homepage.

**Features:**
- 6 random verified products
- Grid layout (responsive)
- Product cards with hover effects
- Loading skeleton

---

### **📂 frontend/src/components/ProductCard.jsx + CSS**

**Purpose**: Reusable product card component.

**Props:**
```javascript
<ProductCard 
  product={productData}
  onAddToCart={handleAddToCart}
/>
```

**Features:**
- Product image
- Name, price, category
- Rating stars
- Stock status
- "Add to Cart" button
- Hover animations
- Click → Navigate to detail page

---

### **📂 frontend/src/components/CustomizationForm.jsx + CSS**

**Purpose**: Dynamic form for entering measurements.

**How it works:**
1. Receives `category` prop (e.g., "Abayas")
2. Reads `customizationConfig.js`
3. If config exists, renders fields
4. Validates input (numbers only, 10-200 range)
5. Shows ₹150 fee notice
6. Calls `onCustomizationChange(data)` on input change

**Collapsible Design:**
- Initially shows button: "Add Custom Measurements"
- Click → Expands form
- Done → Collapses back

**Input Validation:**
```javascript
const handleChange = (fieldId, value) => {
  // Only allow numbers and decimal point
  const sanitized = value.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimals
  const parts = sanitized.split('.');
  const finalValue = parts.length > 2 
    ? parts[0] + '.' + parts.slice(1).join('') 
    : sanitized;
  
  // Range validation
  if (finalValue && parseFloat(finalValue) > 200) return;
  
  setMeasurements({ ...measurements, [fieldId]: finalValue });
};
```

---

### **📂 frontend/src/components/CustomizationDisplay.jsx + CSS**

**Purpose**: Shows entered measurements in cart/orders.

**How it works:**
1. Receives `customizationDetails` (JSON string)
2. Parses JSON
3. Displays as formatted list
4. Shows customization cost badge

**Example Output:**
```
📏 Custom Measurements  [+₹150]
- Bust: 36 inches
- Length: 54 inches
- Shoulder Width: 15 inches
💰 Customization charge: ₹150 per item
```

---

### **📂 frontend/src/components/ui/CloudinaryImage.jsx + CSS**

**Purpose**: Image component with loading states.

**Features:**
- Loading skeleton while image loads
- Error fallback (placeholder image)
- Lazy loading
- Responsive sizing

**Why?** Better UX than broken images or sudden pop-in.

---

### **📂 frontend/src/components/ErrorBoundary.jsx**

**Purpose**: Catches React errors and shows fallback UI.

**Without Error Boundary:**
```
Error → Entire app crashes → Blank white screen
```

**With Error Boundary:**
```
Error → Shows friendly error message → Rest of app still works
```

**Usage:**
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### **📂 frontend/src/pages/CategoryPage.jsx + CSS**

**Purpose**: Shows products filtered by category.

**Route:** `/:category` (e.g., `/Abayas`)

**How it works:**
1. Reads category from URL: `useParams()`
2. Fetches all products
3. Filters by category
4. Displays in grid

**API Call:**
```javascript
const { category } = useParams();
const filteredProducts = products.filter(p => p.category === category);
```

---

## 🎨 **CSS FILES**

### **📂 frontend/src/AdminDashboard.css**
- Styles for admin dashboard
- Tab styles, cards, buttons
- Product/user cards
- Modal styles

### **📂 frontend/src/ProfileScreen.css**
- Profile page styles
- Tab navigation
- Form styles
- Seller product grid
- Order cards
- Modal (edit product)

### **📂 frontend/src/CartScreen.css**
- Cart page layout
- Item cards
- Remove button
- Total price section
- Checkout button

### **📂 frontend/src/ProductDetailScreen.css**
- Product detail layout
- Image gallery
- Product info section
- Customization form area
- Reviews section

---

## 🔄 **COMPLETE USER FLOW DIAGRAMS**

### **Customer Journey: Browse → Buy → Review**

```
1. Homepage
   ↓ (Click product)
2. Product Detail
   ↓ (Add to cart with optional customization)
3. Cart Screen
   ↓ (Proceed to checkout)
4. Shipping Screen (Enter address)
   ↓
5. Payment Screen (Select COD/Online)
   ↓
6. Place Order Screen (Review & confirm)
   ↓ (Place order button)
7. Order Screen (Confirmation)
   ↓ (Navigate to profile)
8. Profile → Order History (View past orders)
```

### **Seller Journey: Upload → Manage → Fulfill**

```
1. Register as Seller
   ↓
2. Seller Dashboard → Upload Products Tab
   ↓ (Fill form, upload images)
3. Submit Product (isVerified = false)
   ↓ (Admin verifies)
4. Product Goes Live (isVerified = true)
   ↓ (Customers buy)
5. Orders Tab → See incoming orders
   ↓ (View customer info, customization)
6. Profile → My Products → Edit/Delete
```

### **Admin Journey: Verify → Manage → Monitor**

```
1. Login as Admin
   ↓
2. Admin Dashboard
   ↓
3. Verify Products Tab
   ↓ (Review pending products)
4. Click "Verify" or "Delete"
   ↓
5. View Customers/Sellers Tabs
   ↓ (Manage users)
6. Delete User (if needed)
```

---

## 🔐 **AUTHENTICATION FLOW**

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─ Register (POST /api/users/register)
       │  ↓
       │  Backend: Hash password → Save user → Generate JWT
       │  ↓
       │  Return: { user data + token }
       │  ↓
       │  Frontend: Store in localStorage
       │
       ├─ Login (POST /api/users/login)
       │  ↓
       │  Backend: Find user → Compare password → Generate JWT
       │  ↓
       │  Return: { user data + token }
       │  ↓
       │  Frontend: Store in localStorage
       │
       ├─ Access Protected Route
       │  ↓
       │  Frontend: Send token in Authorization header
       │  ↓
       │  Backend: protect middleware
       │    - Extract token
       │    - Verify with JWT_SECRET
       │    - Decode → Get user ID
       │    - Fetch user from DB
       │    - Attach to req.user
       │    - Call next()
       │  ↓
       │  Controller: Access req.user
       │
       └─ Logout
          ↓
          Frontend: Remove from localStorage
          ↓
          Redirect to login
```

---

## 📦 **DATA FLOW EXAMPLE: Adding to Cart**

```
1. User clicks "Add to Cart" on ProductDetailScreen
   ↓
2. Frontend: addToCartHandler()
   - Collects: productId, quantity, customization_details
   - POST /api/cart/add
   - Headers: { Authorization: "Bearer token..." }
   ↓
3. Backend: addToCart controller
   - protect middleware: Verify token, get user ID
   - Find product by ID
   - Check stock availability
   - Find/create cart for customer
   - Parse customization JSON
   - Check if has measurements → Add ₹150
   - If item exists: Update quantity
   - If new: Add to cartItems array
   - Calculate total
   - Save cart to MongoDB
   - Return updated cart
   ↓
4. Frontend: Receives cart data
   - Show success message
   - Update cart count in navbar
   - Optionally navigate to cart page
```

---

## 🛠️ **HOW TO RUN THE PROJECT**

### **Prerequisites:**
```bash
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas)
- Cloudinary account (free tier)
```

### **Setup Steps:**

#### 1. **Clone/Download Project**
```bash
cd V_V_code
```

#### 2. **Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Add:
MONGO_URI=mongodb://localhost:27017/v_v_code
JWT_SECRET=your_secret_key_here_make_it_long
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development

# Start backend server
npm start
```

**Backend should show:**
```
MongoDB connected successfully.
Server running on 5000
```

#### 3. **Frontend Setup** (New terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

**Frontend should show:**
```
  ➜  Local:   http://localhost:5173/
```

#### 4. **Access Application**
- Open browser: `http://localhost:5173`

---

## 🎯 **TESTING GUIDE**

### **Create Test Accounts:**

#### 1. **Admin Account**
```javascript
// Manually create in MongoDB or via registration + DB update
{
  email: "admin@test.com",
  password: "admin123",
  role: "admin",
  name: "Admin User"
}
```

#### 2. **Seller Account**
```
- Register at: http://localhost:5173/register
- Select "Seller" role
- Email: seller@test.com
- Password: seller123
```

#### 3. **Customer Account**
```
- Register at: http://localhost:5173/register
- Select "Customer" role
- Email: customer@test.com
- Password: customer123
```

### **Test Scenarios:**

#### **Seller Flow:**
1. Login as seller
2. Upload product with images
3. View in "My Products" (status: Pending)
4. Logout

#### **Admin Flow:**
1. Login as admin
2. Go to Admin Dashboard
3. Verify the seller's product
4. Check stats

#### **Customer Flow:**
1. Login as customer
2. Browse products (now includes verified product)
3. View product details
4. Add measurements for Abaya/Suit
5. Add to cart
6. View cart (see customization + ₹150)
7. Proceed to checkout
8. Enter shipping address
9. Select payment method
10. Place order
11. View order history in profile

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Backend won't start**
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
cd backend
npm install
```

### **Issue 2: MongoDB connection failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Make sure MongoDB is running:
```bash
# Windows: MongoDB service should be running
# Or start manually: mongod
```

### **Issue 3: Images not uploading**
```
Error: Cloudinary credentials not found
```
**Solution:**
- Check `.env` file has correct Cloudinary credentials
- Restart backend server after adding .env

### **Issue 4: 404 on API calls**
```
Cannot PUT /api/users/password
```
**Solution:**
- Restart backend server (it may be running old code)
```bash
# Kill process
taskkill /F /PID <process_id>
# Restart
npm start
```

### **Issue 5: Cart not updating**
```
Cart shows 0 items after adding
```
**Solution:**
- Check if user is logged in
- Check browser console for errors
- Verify token in localStorage

### **Issue 6: CORS errors**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend `server.js` should have:
```javascript
app.use(cors());
```

---

## 📊 **DATABASE COLLECTIONS OVERVIEW**

```
MongoDB: v_v_code
├── users
│   ├── _id
│   ├── name
│   ├── email
│   ├── password (hashed)
│   ├── role (customer/seller/admin)
│   ├── address
│   └── contact
│
├── products
│   ├── _id
│   ├── seller (ref: users)
│   ├── name
│   ├── price
│   ├── description
│   ├── category
│   ├── stock
│   ├── images []
│   ├── isVerified
│   ├── rating
│   └── numReviews
│
├── carts
│   ├── _id
│   ├── customer (ref: users)
│   └── cartItems []
│       ├── product (ref: products)
│       ├── quantity
│       ├── customization_details
│       └── customization_cost
│
├── orders
│   ├── _id
│   ├── customer (ref: users)
│   ├── orderItems []
│   ├── shippingAddress {}
│   ├── paymentMethod
│   ├── totalPrice
│   ├── isPaid
│   └── isDelivered
│
└── reviews
    ├── _id
    ├── customer (ref: users)
    ├── product (ref: products)
    ├── rating
    └── comment
```

---

## 🚀 **DEPLOYMENT PREPARATION**

### **Backend Deployment (Heroku/Railway/Render):**
1. Set environment variables on hosting platform
2. Change `NODE_ENV` to `production`
3. Update CORS to allow frontend domain

### **Frontend Deployment (Vercel/Netlify):**
1. Update `API_BASE_URL` in `config/api.js` to backend URL
2. Run `npm run build`
3. Deploy `dist/` folder

### **Production Checklist:**
- ✅ Remove console.log statements
- ✅ Set secure JWT_SECRET (long, random)
- ✅ Enable HTTPS
- ✅ Set MongoDB to Atlas (cloud)
- ✅ Hide error stack traces in production
- ✅ Add rate limiting
- ✅ Add input sanitization

---

## 📝 **KEY FEATURES SUMMARY**

### **1. Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected routes

### **2. Product Management**
- Multi-image upload
- Admin verification system
- Category-based organization
- Stock management

### **3. Custom Measurements (UNIQUE FEATURE)**
- Category-specific forms (Abayas, Suits)
- Dynamic field rendering
- JSON storage in database
- ₹150 customization fee
- Input validation

### **4. Shopping Cart**
- Persistent cart (database)
- Real-time total calculation
- Customization display
- Quantity management

### **5. Order System**
- 3-step checkout process
- Order history
- Stock reduction on purchase
- Seller order tracking

### **6. Admin Dashboard**
- Product verification
- User management
- Platform statistics
- Delete capabilities

### **7. Seller Dashboard**
- Product upload
- Order tracking
- Product management
- Sales overview

### **8. UI/UX**
- Responsive design
- Modern gradient styles
- Loading states
- Error boundaries
- Smooth animations
- Toast notifications

---

## 🎓 **LEARNING RESOURCES**

### **If you want to understand more:**

**React:**
- Official Docs: https://react.dev
- React Router: https://reactrouter.com

**Node.js/Express:**
- Express Guide: https://expressjs.com
- MongoDB/Mongoose: https://mongoosejs.com

**Authentication:**
- JWT: https://jwt.io
- bcrypt: https://www.npmjs.com/package/bcryptjs

**Styling:**
- Tailwind CSS: https://tailwindcss.com

---

## 💡 **PROJECT HIGHLIGHTS**

### **What Makes This Project Special:**

1. **Full-Stack MERN Application**
   - Complete backend API
   - React frontend
   - MongoDB database

2. **Real-World E-commerce Features**
   - Multi-vendor system
   - Admin approval workflow
   - Shopping cart & checkout
   - Order management

3. **Unique Customization System**
   - Category-specific measurements
   - Dynamic form generation
   - Additional cost calculation

4. **Security Best Practices**
   - Password hashing
   - JWT authentication
   - Role-based access
   - Protected routes

5. **Modern UI/UX**
   - Responsive design
   - Smooth animations
   - Loading states
   - Error handling

6. **Production-Ready**
   - Error boundaries
   - Centralized configuration
   - Clean code structure
   - Deployment ready

---

## 📞 **SUPPORT & DEBUGGING**

### **How to Debug:**

1. **Check Browser Console** (F12)
   - Errors shown here
   - Network tab shows API calls

2. **Check Backend Terminal**
   - Server errors appear here
   - MongoDB connection status

3. **Use Console Logs**
   ```javascript
   console.log('Data:', data);
   ```

4. **Check MongoDB**
   ```bash
   mongosh
   use v_v_code
   db.users.find()
   ```

5. **Verify API with Postman/Thunder Client**
   - Test endpoints directly
   - Check responses

---

This guide covers every file and how the entire system works together! 🎉

For specific questions about any file or feature, feel free to ask!

