import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2191b2f3/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all trips
app.get("/make-server-2191b2f3/trips", async (c) => {
  try {
    console.log('GET /trips - Fetching all trips');
    
    // Get the list of trip IDs
    const tripIds = await kv.get("trip_ids") || [];
    console.log('Trip IDs found:', tripIds);
    
    if (tripIds.length === 0) {
      return c.json({ trips: [] });
    }
    
    // Get all trips individually
    const trips = [];
    for (const id of tripIds) {
      const trip = await kv.get(`trip:${id}`);
      if (trip !== null) {
        trips.push(trip);
      }
    }
    
    console.log('Returning trips:', trips.length);
    
    return c.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return c.json({ error: `Failed to fetch trips: ${error.message}` }, 500);
  }
});

// Get a single trip by ID
app.get("/make-server-2191b2f3/trips/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`GET /trips/${id} - Fetching trip`);
    
    const trip = await kv.get(`trip:${id}`);
    
    if (!trip) {
      return c.json({ error: 'Trip not found' }, 404);
    }
    
    return c.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return c.json({ error: `Failed to fetch trip: ${error.message}` }, 500);
  }
});

// Create a new trip
app.post("/make-server-2191b2f3/trips", async (c) => {
  try {
    const body = await c.req.json();
    const trip = body.trip;
    
    if (!trip || !trip.id) {
      return c.json({ error: 'Invalid trip data - missing id' }, 400);
    }
    
    console.log(`POST /trips - Creating trip ${trip.id}`);
    
    // Save the trip
    await kv.set(`trip:${trip.id}`, trip);
    
    // Update the trip IDs list
    const tripIds = await kv.get("trip_ids") || [];
    if (!tripIds.includes(trip.id)) {
      tripIds.push(trip.id);
      await kv.set("trip_ids", tripIds);
    }
    
    console.log(`Trip ${trip.id} created successfully`);
    return c.json({ success: true, trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    return c.json({ error: `Failed to create trip: ${error.message}` }, 500);
  }
});

// Update an existing trip
app.put("/make-server-2191b2f3/trips/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const trip = body.trip;
    
    if (!trip) {
      return c.json({ error: 'Invalid trip data' }, 400);
    }
    
    console.log(`PUT /trips/${id} - Updating trip`);
    
    // Check if trip exists
    const existingTrip = await kv.get(`trip:${id}`);
    if (!existingTrip) {
      return c.json({ error: 'Trip not found' }, 404);
    }
    
    // Update the trip
    await kv.set(`trip:${id}`, trip);
    
    console.log(`Trip ${id} updated successfully`);
    return c.json({ success: true, trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return c.json({ error: `Failed to update trip: ${error.message}` }, 500);
  }
});

// Delete a trip
app.delete("/make-server-2191b2f3/trips/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`DELETE /trips/${id} - Deleting trip`);
    
    // Check if trip exists
    const existingTrip = await kv.get(`trip:${id}`);
    if (!existingTrip) {
      return c.json({ error: 'Trip not found' }, 404);
    }
    
    // Delete the trip
    await kv.del(`trip:${id}`);
    
    // Update the trip IDs list
    const tripIds = await kv.get("trip_ids") || [];
    const updatedIds = tripIds.filter((tripId: string) => tripId !== id);
    await kv.set("trip_ids", updatedIds);
    
    console.log(`Trip ${id} deleted successfully`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return c.json({ error: `Failed to delete trip: ${error.message}` }, 500);
  }
});

// Bulk update all trips (used for saving all trips at once)
app.post("/make-server-2191b2f3/trips/bulk", async (c) => {
  try {
    const body = await c.req.json();
    const trips = body.trips;
    
    if (!Array.isArray(trips)) {
      return c.json({ error: 'Invalid data - trips must be an array' }, 400);
    }
    
    console.log(`POST /trips/bulk - Saving ${trips.length} trips`);
    
    // Save all trips individually
    for (const trip of trips) {
      await kv.set(`trip:${trip.id}`, trip);
    }
    
    // Update the trip IDs list
    const tripIds = trips.map(trip => trip.id);
    await kv.set("trip_ids", tripIds);
    
    console.log(`${trips.length} trips saved successfully`);
    return c.json({ success: true, count: trips.length });
  } catch (error) {
    console.error('Error bulk saving trips:', error);
    return c.json({ error: `Failed to bulk save trips: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
