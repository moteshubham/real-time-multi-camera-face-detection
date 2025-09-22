// src/index.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import authRoutes from "./routes/auth";

const app = new Hono();

// Routes
app.route("/auth", authRoutes);

// Test route
app.get("/", (c) => c.text("Backend is running 🚀"));

// Start server
serve({
    fetch: app.fetch,
    port: 3000, // you can change if needed
  }, (info: { port: number }) => {
    console.log(`Server running at http://localhost:${info.port}`);
  });