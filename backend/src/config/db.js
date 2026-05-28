import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 3;
let retries = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 — fixes most ECONNREFUSED on Windows
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    retries = 0;

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retries < MAX_RETRIES) {
      retries++;
      const delay = retries * 2000;
      console.log(`🔄 Retrying connection (${retries}/${MAX_RETRIES}) in ${delay / 1000}s...`);
      setTimeout(connectDB, delay);
    } else {
      console.error('💀 Max retries reached. Shutting down.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose error: ${err.message}`);
});

export default connectDB;