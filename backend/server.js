/**
 * SehatConnect Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware

// Security headers - Configure helmet for development with React Native
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false, // Allow cross-origin requests
}));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SehatConnect Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const healthRoutes = require('./routes/healthRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const medicineReminderRoutes = require('./routes/medicineReminderRoutes');
const prescriptionRoutes = require('./routes/prescription.routes');
const intakeRoutes = require('./routes/intake.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SehatConnect API v1.0',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      appointments: '/api/appointments',
      pharmacies: '/api/pharmacies',
      health: '/api/health',
      chatbot: '/api/chatbot',
      emergency: '/api/emergency',
      schemes: '/api/schemes',
      reminders: '/api/reminders',
      prescriptions: '/api/prescriptions',
      intake: '/api/intake',
    },
  });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/reminders', medicineReminderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/intake', intakeRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server with Socket.IO for WebRTC signaling
const PORT = process.env.PORT || 5000;
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

// Initialize Socket.IO for WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebRTC Signaling Room Management
const rooms = new Map(); // Map<roomId, Set<socketId>>
const socketToRoom = new Map(); // Map<socketId, roomId>
const socketToRole = new Map(); // Map<socketId, 'patient' | 'doctor'>

io.on('connection', (socket) => {
  console.log(`🔌 WebSocket connected: ${socket.id}`);

  // Join a signaling room (appointmentId = roomId)
  socket.on('join-room', ({ roomId, role }) => {
    console.log(`👤 ${socket.id} joining room ${roomId} as ${role}`);

    // Leave previous room if any
    const previousRoom = socketToRoom.get(socket.id);
    if (previousRoom && rooms.has(previousRoom)) {
      rooms.get(previousRoom).delete(socket.id);
      socket.leave(previousRoom);
    }

    // Join new room
    socket.join(roomId);
    socketToRoom.set(socket.id, roomId);
    socketToRole.set(socket.id, role);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    // Notify others in room
    const roomSize = rooms.get(roomId).size;
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      role,
      roomSize
    });

    console.log(`✅ Room ${roomId} now has ${roomSize} peer(s)`);
  });

  // Handle unified signal event (offer/answer/ICE)
  socket.on('signal', ({ roomId, type, payload }) => {
    console.log(`📡 Signal from ${socket.id}: ${type} to room ${roomId}`);

    const room = rooms.get(roomId);
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return;
    }

    // Forward to all other peers in room
    room.forEach((peerId) => {
      if (peerId !== socket.id) {
        console.log(`  → Forwarding ${type} to ${peerId}`);
        io.to(peerId).emit('signal', {
          type,
          payload,
          from: socket.id,
        });
      }
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ WebSocket disconnected: ${socket.id}`);

    const roomId = socketToRoom.get(socket.id);
    const role = socketToRole.get(socket.id);

    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);

      // Notify others in room
      socket.to(roomId).emit('peer-left', {
        peerId: socket.id,
        role
      });

      // Clean up empty rooms
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️  Room ${roomId} deleted (empty)`);
      } else {
        console.log(`📉 Room ${roomId} now has ${rooms.get(roomId).size} peer(s)`);
      }
    }

    socketToRoom.delete(socket.id);
    socketToRole.delete(socket.id);
  });

  // Leave room explicitly
  socket.on('leave-room', ({ roomId }) => {
    const role = socketToRole.get(socket.id);
    console.log(`👋 ${socket.id} (${role}) leaving room ${roomId}`);

    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      socket.leave(roomId);
      socket.to(roomId).emit('peer-left', {
        peerId: socket.id,
        role
      });
    }

    socketToRoom.delete(socket.id);
    socketToRole.delete(socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║        🏥  SEHATCONNECT BACKEND SERVER STARTED 🏥       ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`🎥 WebSocket (WebRTC): ws://localhost:${PORT}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
