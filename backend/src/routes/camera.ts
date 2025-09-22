// src/routes/camera.ts
import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, type AuthEnv } from "../middleware/auth";

const camera = new Hono<AuthEnv>();

// Protect all routes with JWT middleware
camera.use("*", authMiddleware);

// Create a new camera
camera.post("/", async (c) => {
  const { name, rtspUrl, location } = await c.req.json();
  const userId = c.get("userId");

  const newCamera = await prisma.camera.create({
    data: { name, rtspUrl, location },
  });

  return c.json(newCamera);
});

// Get all cameras
camera.get("/", async (c) => {
  const cameras = await prisma.camera.findMany({
    orderBy: { id: "asc" }, // sort by ID
  });
  return c.json(cameras);
});

// Get single camera by ID
camera.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const cam = await prisma.camera.findUnique({ where: { id } });
  if (!cam) return c.text("Camera not found", 404);
  return c.json(cam);
});

// Update camera
camera.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { name, rtspUrl, location } = await c.req.json();

  const updatedCam = await prisma.camera.update({
    where: { id },
    data: { name, rtspUrl, location },
  });

  return c.json(updatedCam);
});

// Delete camera
camera.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await prisma.camera.delete({ where: { id } });
  return c.text("Camera deleted");
});

export default camera;
