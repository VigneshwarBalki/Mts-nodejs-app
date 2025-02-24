import express from 'express';
import path from 'path';
import { config } from 'dotenv';
import tracer from 'dd-trace';
import { createClient } from 'redis'; // Correct ES module import
import { randomUUID } from 'crypto';

// Initialize environment variables
config();

// Initialize Datadog tracer
tracer.init({
  service: process.env.DD_SERVICE || 'xforia-technologies',
  env: process.env.DD_ENV || 'production',
  logInjection: true, // Enable log injection for structured logging
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Create a Redis client
const client = createClient({
  socket: {
    host: '10.64.96.12',
    port: 6379,
    connectTimeout: 60000, // Increase timeout to 10 seconds
  },
});

// Handle connection events
client.on('connect', () => {
  console.log('===PG_Connected to Redis======');
});
client.on('error', (err) => {
  console.error('Redis error:', err);
});


// Connect to Redis
client.connect().then(async () => {
  try {
    // Generate a random key
    const randomKey = randomUUID();
    const randomValue = 'random-value';

    // Set the random key and value
    await client.set(randomKey, randomValue);

    // Retrieve the value
    const value = await client.get(randomKey);
    console.log('Retrieved value for random key:', value);
  } catch (error) {
    console.error('Redis operation error:', error);
  } finally {
    // Close the connection
    //await client.quit();
  }
});

// Health check route to verify Redis connection
app.get('/redis-ping-health', async (req, res) => {
  try {
    // Generate a random key for health check
    const randomKey = "ABC-pg";
    const randomValue = 'health-check-value';

    // Set and get the random key
    await client.set(randomKey, randomValue);
    const value = await client.get(randomKey);
    console.log("value", value)
    console.log("randomValue", randomValue)
    if (value === randomValue) {
      res.status(200).send('Redis Server is connected to Cloud Run');
    } else {
      res.status(503).send('Redis is not connected or operational');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).send('Redis is not connected or operational');
  }
});

// Resolve the directory for static files
const staticPath = path.resolve('static');
console.log(`Serving static files from: ${staticPath}`); // Debug logging

// Middleware to serve static files
app.use(express.static(staticPath));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve('static/webpage.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
