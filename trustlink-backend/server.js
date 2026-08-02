const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Workaround for Windows local DNS SRV resolution issues with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS override errors in environments where not supported
}

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 1. DATABASE CONNECTION
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustlink';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ SUCCESS: Connected to MongoDB");
  } catch (err) {
    console.error("❌ DB CONNECTION ERROR:", err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      console.log("💡 TIP: Verify your MongoDB Atlas cluster state and Network Access IP whitelist (allow 0.0.0.0/0 in Atlas dashboard).");
    }
    console.log("Retrying connection in 10 seconds...");
    setTimeout(connectDB, 10000);
  }
};
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST', 'PATCH'] }
});

// Socket connection and room assignment
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 2. ROUTERS
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const bondRoutes = require('./routes/bonds');
const reviewRoutes = require('./routes/reviews');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/bonds', bondRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 TrustLink Server & Sockets live on Port ${PORT}`));