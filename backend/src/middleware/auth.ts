// src/middleware/auth.ts
import { Context, Next, type MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Typed env to store values on context
export type AuthEnv = { Variables: { userId: number } };

export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c: Context<AuthEnv>, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization"); // Get Authorization header
    if (!authHeader) return c.text("Unauthorized", 401);

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Store userId in context variables
    c.set("userId", decoded.userId);

    await next();
  } catch (err) {
    return c.text("Invalid or expired token", 401);
  }
};
