const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const restaurantPublicRoutes = require('./routes/restaurantPublicRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const restaurantDashboardRoutes = require('./routes/restaurantDashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantPublicRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/restaurant', restaurantDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'DineEasy Multi-Restaurant System API',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);

  // Restaurant joins their dedicated room
  socket.on('join_restaurant', (restaurantId) => {
    if (restaurantId) {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant_${restaurantId}`);
    }
  });

  // Admin joins admin channel
  socket.on('join_admin', () => {
    socket.join('admin_channel');
    console.log(`Socket ${socket.id} joined admin_channel`);
  });

  // Customer joins personal user room
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(` DineEasy API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

