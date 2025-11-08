# 🍕 Pizza Ordering Application

A modern, full-stack MERN (MongoDB, Express, React, Node.js) pizza ordering application with beautiful UI/UX, custom pizza builder, Google Pay integration, and real-time order tracking.

## 🚀 Live Demo

### 🌐 Deployed Application

**Frontend:** https://oib-3siz1r4o3-dhaundiyalabhishek634-gmailcoms-projects.vercel.app

**Backend API:** https://oib-sip.onrender.com

**Test Credentials:**
- **User:** `user@test.com` / `user123`
- **Admin:** `admin@pizzaapp.com` / `admin123`

> **Note:** The free tier backend on Render may take 30-60 seconds to wake up on first request if it's been inactive.

---

### Deployment Options

**Frontend (Vercel):**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lucky2907/OIB-SIP/tree/main/frontend)

**Backend (Render):**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Lucky2907/OIB-SIP)

**Quick Deploy Instructions:**
1. **Frontend on Vercel:**
   - Click "Deploy with Vercel" button above
   - Connect your GitHub account
   - Select the `frontend` folder as root directory
   - Add environment variable: `VITE_API_URL=https://oib-sip.onrender.com/api`
   - Deploy!

2. **Backend on Render:**
   - Click "Deploy to Render" button above
   - Connect your GitHub account
   - Set root directory: `backend`
   - Add environment variables from `.env.example`
   - Deploy!

3. **Database (MongoDB Atlas):**
   - Already configured in the code
   - Free tier: https://www.mongodb.com/cloud/atlas

---

## ✨ Features

### 👤 User Features
- **Authentication & Security**
  - User registration with automatic email verification
  - Secure JWT-based login/logout
  - Password reset with email tokens
  
- **Pizza Customization**
  - Browse 10 delicious pre-made pizzas (Margherita, Pepperoni, BBQ Chicken, etc.)
  - 6-step custom pizza builder:
    1. Select Base (Thin Crust, Thick Crust, Cheese Burst, etc.)
    2. Choose Sauce (Marinara, BBQ, White Sauce, etc.)
    3. Pick Cheese (Mozzarella, Cheddar, Feta - Optional)
    4. Add Veggies (Multiple selections - Optional)
    5. Add Meat (Chicken, Pepperoni, Sausage - Optional)
    6. Choose Size & Crust Type with dynamic pricing
  
- **Shopping & Payment**
  - Add to cart functionality with persistent storage
  - Real-time price calculation including size/crust extras
  - Google Pay integration (Test mode)
  - Direct checkout from customization page
  
- **Order Management**
  - View order history with detailed timeline
  - Real-time order status updates via Socket.io
  - Beautiful order tracking interface

### 👨‍💼 Admin Features
- **Dashboard**
  - Statistics overview (Total Orders, Revenue, Active Orders)
  - Recent orders display
  - Quick access to all features
  
- **Inventory Management**
  - Manage pizzas, bases, sauces, cheese, veggies, and meat
  - Add/Edit/Delete items with price control
  - Stock level monitoring with automatic updates
  - Low stock threshold alerts
  
- **Order Management**
  - View all customer orders
  - Update order status: Order Received → In Kitchen → Out for Delivery → Delivered
  - Real-time notifications for new orders

## 🚀 Tech Stack

### Backend
- **Runtime & Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt password hashing
- **Real-time:** Socket.io for live order updates
- **Payment:** Google Pay API integration
- **Email:** Nodemailer for notifications
- **Security:** CORS, Helmet, Express Validator
- **Task Scheduling:** Node-cron for automated jobs

### Frontend
- **Framework:** React 18.2 with Vite 5.4
- **Routing:** React Router v6
- **State Management:** React Context API
- **UI Framework:** Tailwind CSS 3.4.17
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Carousel:** Swiper
- **Storage:** LocalStorage for cart persistence

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account (for email notifications)
- Google Pay Business Console access (for payment integration)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file by copying `.env.example`:
```bash
copy .env.example .env
```

## 📦 Installation & Setup

### Prerequisites
- Node.js v14+ installed
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email notifications
- Modern web browser with Google Pay support

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pizza-app
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   EMAIL_FROM=noreply@pizzaapp.com
   ADMIN_EMAIL=admin@pizzaapp.com
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3001
   ```

4. **Seed the database:**
   ```bash
   node seed.js
   ```
   This creates:
   - 3 users (1 admin, 2 regular users)
   - 10 ready-made pizzas
   - 28 inventory items (bases, sauces, cheese, veggies, meat)

5. **Start the backend server:**
   ```bash
   node server.js
   ```
   Backend runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:3001`

## 🔐 Default Login Credentials

After running `seed.js`, use these accounts:

**Admin Account:**
- Email: `admin@pizzaapp.com`
- Password: `admin123`
- Access: Full admin dashboard, inventory, and order management

**Test User:**
- Email: `user@test.com`
- Password: `user123`
- Access: User dashboard, pizza ordering, order history

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail
2. Generate App-Specific Password:
   - Go to [Google Account](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this password in `EMAIL_PASSWORD` in `.env`

## 💳 Google Pay Setup (Test Mode)

The app uses Google Pay in TEST mode, which means:
- No real transactions are processed
- No merchant ID required for testing
- Simulated payment flow for development

For production:
1. Get a Google Pay merchant ID from [Google Pay Business Console](https://pay.google.com/business/console)
2. Update payment gateway parameters in `CustomizePizza.jsx`
3. Add proper SSL certificate for your domain

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/verify-email/:token` | Verify email address | No |
| POST | `/forgot-password` | Request password reset | No |
| PUT | `/reset-password/:token` | Reset password | No |
| GET | `/me` | Get current user profile | Yes |

### Inventory Routes (`/api/inventory`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all inventory items | No |
| GET | `/category/:category` | Get items by category | No |
| GET | `/low-stock` | Get low stock items | Admin |
| GET | `/:id` | Get single item | No |
| POST | `/` | Create new item | Admin |
| PUT | `/:id` | Update item | Admin |
| DELETE | `/:id` | Delete item | Admin |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-googlepay-order` | Initialize payment | Yes |
| POST | `/calculate-price` | Calculate pizza price | Yes |
| POST | `/` | Create order | Yes |
| GET | `/` | Get all orders | Admin |
| GET | `/my-orders` | Get user's orders | Yes |
| GET | `/:id` | Get single order | Yes |
| PUT | `/:id/status` | Update order status | Admin |

## 🎯 Key Features Explained

### 🔔 Real-time Updates (Socket.io)
- **Connection:** Established automatically on user login
- **Admin Notifications:** Instant alerts for new orders
- **User Updates:** Live order status changes
- **Room-based:** Each user joins their own room by user ID

### 📦 Smart Inventory Management
- **Auto Stock Update:** Deducts ingredients when order is placed
- **Availability Check:** Items marked unavailable when quantity = 0
- **Low Stock Alerts:** Email notifications when below threshold (20 units)
- **Category-based:** Pizzas, Bases, Sauces, Cheese, Veggies, Meat

### 🍕 Custom Pizza Builder Flow
1. **Select Pizza:** Choose from 10 pre-made pizzas or custom
2. **Step 1 - Base:** Required (Thin, Thick, Cheese Burst, etc.)
3. **Step 2 - Sauce:** Required (Marinara, BBQ, White, Pesto, Buffalo)
4. **Step 3 - Cheese:** Optional (Skip button available)
5. **Step 4 - Veggies:** Optional (Multiple selections)
6. **Step 5 - Meat:** Optional (Multiple selections)
7. **Step 6 - Summary:** Choose size (S/M/L) & crust (Regular/Thick/Stuffed)

### 💰 Dynamic Pricing
- Base ingredient prices calculated from database
- Size extras: Small (+₹0), Medium (+₹50), Large (+₹100)
- Crust extras: Regular (+₹0), Thick (+₹30), Stuffed (+₹60)
- Real-time total updates as selections change
- Quantity multiplier applied at checkout

### 🎨 UI/UX Features
- **Glassmorphism Design:** Modern frosted glass effects
- **Framer Motion:** Smooth page transitions and animations
- **Responsive Layout:** Mobile-first design with Tailwind CSS
- **Toast Notifications:** Real-time feedback for all actions
- **Loading States:** Skeleton screens and spinners
- **Error Handling:** User-friendly error messages

## 📁 Project Structure

```
pizza-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── inventoryController.js # Inventory CRUD
│   │   └── orderController.js    # Order & payment logic
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Inventory.js          # Inventory schema
│   │   └── Order.js              # Order schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── inventory.js          # Inventory routes
│   │   └── orders.js             # Order routes
│   ├── utils/
│   │   ├── sendEmail.js          # Email utility
│   │   └── tokenHelper.js        # Token generation
│   ├── .env                      # Environment variables
│   ├── seed.js                   # Database seeding
│   └── server.js                 # Express server
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cart.jsx          # Shopping cart
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── PizzaCard.jsx     # Pizza display card
│   │   │   └── PrivateRoute.jsx  # Auth guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state
│   │   │   └── CartContext.jsx   # Cart state
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration
│   │   │   ├── Dashboard.jsx     # User dashboard
│   │   │   ├── CustomizePizza.jsx # Pizza builder
│   │   │   ├── MyOrders.jsx      # Order history
│   │   │   ├── AdminDashboard.jsx # Admin home
│   │   │   ├── AdminInventory.jsx # Inventory mgmt
│   │   │   ├── AdminOrders.jsx   # Order mgmt
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── styles/
│   │   │   ├── Admin.css
│   │   │   ├── App.css
│   │   │   ├── Auth.css
│   │   │   ├── CustomizePizza.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Navbar.css
│   │   │   └── Orders.css
│   │   ├── utils/
│   │   │   └── api.js            # Axios config
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── .env                      # Environment variables
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md

```

## 🚀 Usage Guide

### For Users

1. **Register/Login**
   - Navigate to http://localhost:3001
   - Click "Register" to create an account
   - Verify email (auto-verified in development)
   - Login with credentials

2. **Order Pizza**
   - Browse 10 delicious pizzas on the dashboard
   - Click on any pizza to customize
   - Follow the 6-step builder
   - Add to cart or checkout directly
   - Complete payment via Google Pay

3. **Track Orders**
   - View "My Orders" from navbar
   - See real-time status updates
   - Track: Order Received → In Kitchen → Out for Delivery → Delivered

### For Admins

1. **Login**
   - Use admin credentials: `admin@pizzaapp.com` / `admin123`
   - Access admin dashboard

2. **Manage Inventory**
   - View all items (pizzas, bases, sauces, cheese, veggies, meat)
   - Add new items with name, category, price, quantity
   - Edit existing items
   - Delete items
   - Monitor stock levels

3. **Manage Orders**
   - View all customer orders
   - Update order status in real-time
   - Customers receive instant notifications

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
node server.js
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Seeding
```bash
cd backend
node seed.js
```
Creates:
- **3 Users:** 1 admin + 2 test users
- **10 Pizzas:** Margherita, Pepperoni, BBQ Chicken, Veggie Supreme, Hawaiian, Meat Lovers, Four Cheese, Spicy Mexican, Mushroom Truffle, Garden Fresh
- **28 Ingredients:** 5 bases, 5 sauces, 5 cheese types, 8 veggies, 5 meat options

### Build for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB Atlas cluster is running
- Whitelist your IP address in MongoDB Atlas

**Port 5000 already in use:**
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill node
```

**Email not sending:**
- Verify Gmail app password is correct
- Check 2FA is enabled on Gmail
- Ensure EMAIL_USER and EMAIL_PASSWORD are set in `.env`

### Frontend Issues

**Port 3001 already in use:**
- Vite will automatically try next available port
- Or manually stop existing Vite process

**API connection failed:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in backend

**Google Pay not working:**
- Test mode requires HTTPS in production
- Use test cards provided by Google Pay
- Check browser console for errors

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@pizzaapp.com
ADMIN_EMAIL=admin@pizzaapp.com
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=optional_for_future
```

## 📜 License

This project is created for educational purposes.

## 👨‍💻 Author

**Abhishek Dhaundiyal**
- Email: dhaundiyalabhishek634@gmail.com

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vite for lightning-fast development
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations
- Socket.io for real-time features

---

**Made with ❤️ and 🍕**
│   │   │   ├── Dashboard.css
│   │   │   ├── Navbar.css
│   │   │   ├── CustomizePizza.css
│   │   │   ├── Orders.css
│   │   │   └── Admin.css
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or MongoDB Atlas connection string is correct
- Check if the port 27017 is available

### Email Not Sending
- Verify Gmail app password is correct
- Check if 2-factor authentication is enabled
- Ensure less secure app access is disabled (use app password instead)

### Payment Integration Issues
- Verify Google Pay merchant ID is correct
- Ensure Google Pay is enabled in your browser
- Check if Google Pay script is loaded in `index.html`
- Test with supported payment methods in Google Pay

### Socket.io Connection Failed
- Ensure backend server is running
- Check CORS configuration
- Verify frontend is connecting to correct backend URL

## 🌐 Deployment Guide

### Deploy Frontend to Vercel

1. **Prerequisites:**
   - GitHub account
   - Vercel account (free): https://vercel.com/signup

2. **Steps:**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Or use Vercel Dashboard
   ```

3. **Via Vercel Dashboard:**
   - Go to https://vercel.com/new
   - Import your GitHub repository: `Lucky2907/OIB-SIP`
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

4. **Deploy:** Click "Deploy" and wait 1-2 minutes

### Deploy Backend to Render

1. **Prerequisites:**
   - GitHub account
   - Render account (free): https://render.com/register

2. **Steps:**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Lucky2907/OIB-SIP`
   - Configure:
     - Name: `pizza-app-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `node server.js`
   
3. **Environment Variables:**
   Add these in Render dashboard:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@pizzaapp.com
   ADMIN_EMAIL=admin@pizzaapp.com
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy:** Click "Create Web Service"

### Alternative: Deploy to Railway

**Backend:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Post-Deployment Checklist

- [ ] Update `VITE_API_URL` in Vercel with your Render backend URL
- [ ] Update `FRONTEND_URL` in Render with your Vercel frontend URL
- [ ] Test user registration and login
- [ ] Test pizza customization and ordering
- [ ] Verify email notifications work
- [ ] Test admin dashboard access
- [ ] Check real-time order updates

### Free Tier Limitations

**Vercel (Free):**
- ✅ Unlimited deployments
- ✅ Custom domains
- ⚠️ 100GB bandwidth/month
- ⚠️ Functions timeout: 10s

**Render (Free):**
- ✅ 750 hours/month
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Takes 30-60s to wake up
- ⚠️ 512MB RAM

**MongoDB Atlas (Free):**
- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited to 100 connections

---

## Testing

Test the application locally before deploying:

```bash
# Backend
cd backend
npm test

# Frontend  
cd frontend
npm run build
npm run preview
```

## 📱 Screenshots

> Add screenshots of your application here after deployment

## 🎯 Future Enhancements
- 📍 Order tracking map integration with live location
- ⭐ User reviews and ratings system
- 🎁 Loyalty points and rewards program
- 💳 Multiple payment gateway options (Stripe, PayPal)
- 📱 SMS notifications for order updates
- 📊 Advanced admin analytics dashboard
- 🏷️ Promo codes and discount system
- 🌍 Multi-language support (i18n)
- 🖼️ Image upload for custom pizzas
- 📧 Email marketing integration

## 📝 License
This project is created for educational purposes as part of the Oasis Infobyte Internship program.

## 👨‍💻 Author

**Abhishek Dhaundiyal**
- GitHub: [@Lucky2907](https://github.com/Lucky2907)
- Email: dhaundiyalabhishek634@gmail.com
- Repository: [OIB-SIP](https://github.com/Lucky2907/OIB-SIP)

## 🙏 Acknowledgments

- **Oasis Infobyte** for the internship opportunity
- **MongoDB Atlas** for database hosting
- **Vite** for lightning-fast development experience
- **Tailwind CSS** for beautiful, responsive styling
- **Framer Motion** for smooth animations
- **Socket.io** for real-time features
- Open-source community for amazing tools and libraries

## 📞 Support

For issues, questions, or suggestions:
- 🐛 [Create an Issue](https://github.com/Lucky2907/OIB-SIP/issues)
- 💬 [Start a Discussion](https://github.com/Lucky2907/OIB-SIP/discussions)
- ⭐ Star this repo if you found it helpful!

---

<div align="center">

**Made with ❤️ and 🍕 by Abhishek Dhaundiyal**

⭐ Star this repository if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/Lucky2907/OIB-SIP?style=social)](https://github.com/Lucky2907/OIB-SIP/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Lucky2907/OIB-SIP?style=social)](https://github.com/Lucky2907/OIB-SIP/network/members)

</div>
