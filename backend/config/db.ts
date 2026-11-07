import mongoose from 'mongoose';

let isMongoConnected = false;
let connectionError: string | null = null;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'medilink_lab_dev';

  if (!uri) {
    console.error('❌ FATAL: MONGODB_URI is missing. Cannot start server.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas connected successfully to DB: ${dbName} (${conn.connection.host})`);
    isMongoConnected = true;
    connectionError = null;
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    isMongoConnected = false;
    connectionError = error.message;
    // Crash the server instead of falling back to local files
    process.exit(1); 
  }
};

export const getDBStatus = () => {
  return {
    isConnected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Atlas' : 'Disconnected',
    uriConfigured: Boolean(process.env.MONGODB_URI),
    error: connectionError,
  };
};

export default connectDB;