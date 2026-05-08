import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import { MongoMemoryServer } from 'mongodb-memory-server';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import tableRoutes from './routes/tables.js';
import analyticsRoutes from './routes/analytics.js';
import staffRoutes from './routes/staff.js';
import { seedDatabase } from './seed.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] } });

app.use(cors());
app.use(express.json());
app.set('io', io);

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

async function start() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  console.log('📦 MongoDB Memory Server connected');
  await seedDatabase();
  console.log('🌱 Database seeded');
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

start().catch(console.error);
