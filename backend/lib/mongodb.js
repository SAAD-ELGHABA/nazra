const mongoose = require("mongoose");

// Tracks an in-flight connection so concurrent requests on a cold serverless
// instance share one handshake instead of each opening their own.
let connectionPromise = null;

// readyState is the only honest source of truth: a cached boolean stays true
// after the socket drops, and every later request then skips reconnecting and
// fails on the query instead. On a public catalog request that surfaces to the
// visitor as "Impossible de charger la collection".
const isConnected = () => mongoose.connection.readyState === 1;

// Mongoose reconnects on its own, but the resolved promise above would
// otherwise let a request through while the socket is down. Dropping it on
// disconnect means the next request re-establishes the connection itself.
mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
});

async function connectDB() {
  if (isConnected()) return;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      })
      .then((connection) => {
        console.log("✅ MongoDB connected");
        return connection;
      })
      .catch((err) => {
        // Clearing the promise lets the next request retry rather than reusing
        // a permanently rejected one.
        connectionPromise = null;
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  await connectionPromise;
}

module.exports = connectDB;
