import { MongoClient } from "mongodb";

// During build time, we don't need an actual MongoDB connection
// This prevents build errors when MONGODB_URI is not available
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

if (!process.env.MONGODB_URI && !isBuildTime) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI || 'mongodb://placeholder:27017';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

// Skip actual connection during build time
if (isBuildTime) {
  // Provide a dummy promise that never resolves during build
  const dummyClient = {} as MongoClient;
  clientPromise = Promise.resolve(dummyClient);
} else if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("✅ Connected to MongoDB successfully");
        return client;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((client) => {
      console.log("✅ Connected to MongoDB successfully");
      return client;
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Error:", error);
      throw error;
    });
}

// Export a function to get the database connection
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "resume-builder");
  return { db, client };
}

export default clientPromise;
