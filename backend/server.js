require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cron = require('node-cron');
const Inventory = require('./models/Inventory');
const sendEmail = require('./utils/sendEmail');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://pizza-ij1p4jyxd-dhaundiyalabhishek634-gmailcoms-projects.vercel.app'
];

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for now (you can restrict later)
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join room based on user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/test', require('./routes/test'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    corsAllowed: 'All origins currently allowed for testing',
    database: {
      connected: require('mongoose').connection.readyState === 1,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState]
    }
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Pizza App API is running' });
});

// Deep health probe including DB state
app.get('/healthz', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'unauthorized', 'unknown'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({
    ok: true,
    db: state,
    mongoUriPresent: Boolean(process.env.MONGODB_URI)
  });
});

// Cron job to check inventory and send alerts (runs every day at 9 AM)
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running daily inventory check...');
    
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    });
    
    if (lowStockItems.length > 0) {
      const itemsList = lowStockItems.map(item => 
        `<li><strong>${item.name}</strong> (${item.category}): ${item.quantity} units (Threshold: ${item.threshold})</li>`
      ).join('');
      
      const message = `
        <h1>Daily Low Stock Alert</h1>
        <p>The following items are running low on stock:</p>
        <ul>${itemsList}</ul>
        <p>Please restock these items as soon as possible.</p>
      `;
      
      await sendEmail({
        email: process.env.ADMIN_EMAIL,
        subject: 'Daily Low Stock Alert - Pizza App',
        message
      });
      
      console.log('Low stock alert email sent');
    } else {
      console.log('All items are sufficiently stocked');
    }
  } catch (error) {
    console.error('Error in inventory check cron job:', error);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
