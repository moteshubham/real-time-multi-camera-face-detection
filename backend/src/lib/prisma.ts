// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Create one Prisma client instance for whole app
const prisma = new PrismaClient();

export default prisma;