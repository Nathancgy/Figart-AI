import mongoose from 'mongoose';

// Define the type for our cached mongoose connection
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Define the global namespace
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/figart-ai';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize the cached connection
let cached: CachedConnection = global.mongooseConnection || { conn: null, promise: null };

// If the cached connection doesn't exist, create it
if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a promise to connect, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  
  try {
    // Wait for the connection
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    // If there's an error, clear the promise so we can try again
    cached.promise = null;
    throw e;
  }
}

export default connectToDatabase; 