import { Hono } from "hono";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

//Signup route

auth.post("/signup", async (c) => {
  const { username, password } = await c.req.json();

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });
  return c.json({ message: "User created successfully", userId: user.id });
});

// Login route
auth.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  // Find user
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return c.text("Invalid credentials", 401);

  // Compare passwords
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.text("Invalid credentials", 401);

  // Sign JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

  return c.json({ token });
});

export default auth;
