// src/routes/alert.ts
import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const alert = new Hono();

// Protect all routes with JWT middleware
alert.use("*", authMiddleware);

// Get alerts, optionally filtered by camera
alert.get("/", async (c) => {
  const cameraId = c.req.query("cameraId"); // ?cameraId=1
  const page = Number(c.req.query("page") || 1);
  const limit = Number(c.req.query("limit") || 20);
  const skip = (page - 1) * limit;

  const where = cameraId ? { cameraId: Number(cameraId) } : {};

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { timestamp: "desc" },
    skip,
    take: limit,
    include: { camera: true }, // include camera info
  });

  return c.json(alerts);
});

export default alert;
