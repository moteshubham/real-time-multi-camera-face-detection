# Real-Time Multi-Camera Face Detection - Project Learnings

## Project Overview

This document outlines the step-by-step development process for building a real-time multi-camera face detection system. The project is broken into phases that can be followed like a checklist.

## Development Phases

### Phase 0 – Preparation (0.5 day)

#### Required Software Installation
- Node.js + npm/yarn
- Go
- Docker & Docker Compose
- PostgreSQL locally (or via Docker)

#### Project Structure Setup
Create a monorepo folder with the following structure:

```
fullstack-face-detection/
├── frontend/
├── backend/
├── worker/
├── infra/
└── README.md
```

#### Initial Setup
- Initialize git and GitHub repository

---

### Phase 1 – Database & Infrastructure (0.5 day)

#### Database Schema Design (PostgreSQL + Prisma)
Define the following tables:

- **Users**: `id`, `username`, `password_hash`
- **Cameras**: `id`, `name`, `rtsp_url`, `location`
- **Alerts**: `id`, `camera_id`, `timestamp`, `snapshot_url`

#### Docker Compose Setup
Create `docker-compose.yml` in `infra/` directory with:
- PostgreSQL
- MediaMTX
- Placeholder services for backend, frontend, and worker

#### Database Testing
- Test database connection from a small Node.js script

---

### Phase 2 – Backend APIs (2 days)

#### Project Setup
- Set up Node.js + TypeScript + Hono project

#### Authentication Implementation
- **JWT Authentication**:
  - Signup/login APIs
  - Protect camera/alert APIs

#### Camera Management APIs
- **Camera CRUD Operations**:
  - Create cameras
  - Read camera list
  - Update camera details
  - Delete cameras

#### Alerts System
- **Alerts API**:
  - List alerts with pagination/filtering
  - Set up WebSocket endpoint for real-time alerts

#### Testing
- Test all APIs with Postman or curl

---

### Phase 3 – Worker Service (2 days)

#### Project Setup
- Set up Go project in `worker/` directory

#### Video Processing Pipeline
- Read RTSP streams using FFmpeg/OpenCV
- Run face detection on frames (using go-face or OpenCV models)
- Draw bounding boxes on detected faces
- Send processed video to MediaMTX for WebRTC

#### Alert System Integration
- Post alerts to backend API when faces are detected

#### Reliability Features
- Reconnect streams if camera goes offline
- Drop frames if processing is lagging
- Test with 2–3 camera streams

---

### Phase 4 – Frontend Application (2 days)

#### Project Setup
- Set up React + TypeScript + Vite project

#### Authentication
- Build Login Page with JWT authentication

#### Dashboard UI Components
- **Camera Management**:
  - Camera grid display
  - Camera CRUD operations (connect to backend APIs)
- **Live Video Streaming**:
  - Live WebRTC video per camera
  - Start/Stop stream buttons
- **Real-time Alerts**:
  - Subscribe to WebSocket alerts
  - Show alerts per camera in real-time

#### Styling
- Style using MUI or Tailwind CSS

---

### Phase 5 – Polish & Testing (1 day)

#### Testing Implementation
- **Unit/Integration Tests**:
  - Backend APIs testing
  - Frontend components testing

#### Docker Integration
- Ensure Docker Compose brings up everything:
  ```bash
  docker-compose up --build
  ```

#### Documentation
- Write comprehensive README.md:
  - Project overview
  - Tech stack details
  - Run instructions
  - Test credentials
- Optional: Record demo video

---

## Time Estimation

| Phase | Duration |
|-------|----------|
| Prep & Infrastructure | 1 day |
| Backend Development | 2 days |
| Worker Service | 2 days |
| Frontend Development | 2 days |
| Polish & Testing | 1 day |
| **Total** | **7–8 days** |

---

## Database Management Commands

### Starting PostgreSQL Container

```bash
# Start Postgres container in background
docker-compose -f infra/docker-compose.yml up -d

# Show running containers
docker ps

# Enter Postgres using psql client (installed on your machine)
psql -h localhost -p 5432 -U admin -d facedb

# Stop Postgres container
docker-compose -f infra/docker-compose.yml down

# Stop and delete container + volume (reset DB)
docker-compose -f infra/docker-compose.yml down -v
```

### Using psql Inside Container (Recommended)

```bash
# Run this command to access PostgreSQL inside the container
docker exec -it postgres-db psql -U admin -d facedb
```

**Command breakdown:**
- `docker exec -it` → run a command inside a running container interactively
- `postgres-db` → name of your container (from docker-compose.yml)
- `psql -U admin -d facedb` → open the DB using user admin, database facedb

### Useful PostgreSQL Commands

All PostgreSQL commands end with `;`:

| Command | Description |
|---------|-------------|
| `\conninfo` | Check connection (shows DB name, user, host, and port) |
| `\l` | List all databases |
| `\dt` | List all tables in current database |
| `\q` | Exit psql |

### Database Testing

```sql
-- Create a quick test table
CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- Insert a row
INSERT INTO test_table (name) VALUES ('Hello Postgres');

-- Query the table
SELECT * FROM test_table;
```

**Expected output:**
```
 id |     name
----+---------------
  1 | Hello Postgres
```

✅ This confirms your database works correctly inside Docker.


Great 👍 Let’s set up Prisma for your backend.

1. Install Prisma + Client

Run these inside your backend/ folder (where you’ll build your API):

# Initialize a Node.js project (creates package.json)
npm init -y  

# Install Prisma CLI as dev dependency
npm install prisma --save-dev  

# Install Prisma client (to query DB in code)
npm install @prisma/client  

# Initialize Prisma (creates prisma/schema.prisma file)
npx prisma init  


👉 What these commands do:

npm init -y → creates a default Node.js project

npm install prisma --save-dev → installs the Prisma CLI tools for migrations

npm install @prisma/client → lets your code talk to Postgres

npx prisma init → generates prisma/schema.prisma + .env

2. Configure .env

Inside backend/.env, replace the DB URL:

DATABASE_URL="postgresql://admin:admin123@localhost:5432/facedb?schema=public"
url structure - postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA

⚡Note: Use localhost if you run backend directly.
If backend runs in Docker later, change it to postgres (the Docker service name).

3. Define Prisma Schema

Open backend/prisma/schema.prisma and write this:

// schema.prisma

// Datasource: Connect Prisma to PostgreSQL
datasource db {
  provider = "postgresql"                         // Use Postgres as database
  url      = env("DATABASE_URL")                  // Connection string from .env
}

// Generator: Creates Prisma Client for Node.js
generator client {
  provider = "prisma-client-js"
}

// User model: For login/authentication
model User {
  id        Int      @id @default(autoincrement()) // Primary key
  username  String   @unique                       // Unique username
  password  String                                // Hashed password
  createdAt DateTime @default(now())               // Timestamp
  updatedAt DateTime @updatedAt                    // Auto-updated on change
}

// Camera model: Stores RTSP camera info
model Camera {
  id        Int      @id @default(autoincrement()) // Primary key
  name      String                                 // Camera name
  rtspUrl   String                                 // RTSP stream URL
  location  String?                                // Optional location
  createdAt DateTime @default(now())               // Timestamp
  alerts    Alert[]                                // Relation: One camera has many alerts
}

// Alert model: Stores face detection events
model Alert {
  id        Int      @id @default(autoincrement()) // Primary key
  timestamp DateTime @default(now())               // When face detected
  snapshot  String?                                // Path/URL to snapshot
  camera    Camera   @relation(fields: [cameraId], references: [id]) // Link to camera
  cameraId  Int
}

4. Apply Migration

Run this to create tables in Postgres:

# Create migration file + apply to DB
npx prisma migrate dev --name init  

# Open Prisma Studio (web UI to view tables/data)
npx prisma studio  


👉 What these do:

npx prisma migrate dev --name init → creates User, Camera, Alert tables in your Postgres DB.

npx prisma studio → opens a local web UI (http://localhost:5555
) to browse/edit DB.

✅ Now your database + Prisma schema are ready.
Next step will be building backend APIs with Hono + JWT auth + Prisma.

Do you want me to start with the backend folder structure + login/signup API setup




Prisma generate vs. migrate
Command	Purpose	Direction of Flow
prisma generate	Creates the Prisma Client code for your app.	schema.prisma ➡️ Your application code
prisma migrate	Updates your database schema.	schema.prisma ➡️ Your database

Export to Sheets
Simple Analogy
Imagine building an office building:

prisma migrate is the construction crew 👷‍♀️ that physically builds and alters the building (the database) based on the blueprint (schema.prisma).

prisma generate is the furniture maker 🛋️ that creates custom furniture (the Prisma Client) that perfectly fits the building's new layout, allowing developers to work.

Important Concepts
1. The Prisma Schema (schema.prisma)
This is the single source of truth 📜. It's the blueprint that defines your database's tables and the models your application will use.

2. The Prisma Client (@prisma/client)
This is a type-safe query builder 🛠️. It's the tool your application code uses to interact with the database. It is generated by prisma generate and knows about all your models and their fields.

3. Migration Files
These are version-controlled SQL scripts 📝, stored in prisma/migrations.

They contain the specific SQL commands needed to change your database from one state to another.

prisma migrate creates and applies these files.

They are the canonical history of your database schema.

4. Schema Drift
A "schema drift" occurs when your database schema is out of sync with your project's migration history.

This is a bad state to be in, as Prisma's tools can no longer reliably track and manage changes.

Key Workflows and Best Practices
The Correct Workflow
Always make schema changes in your schema.prisma file first.

The standard development command, npx prisma migrate dev, handles everything for you. It:

Creates a new migration file to reflect your changes.

Applies that migration to your database.

Automatically runs prisma generate to update the Prisma Client.

This ensures your database, schema file, and application code are always in sync.

What happens if you skip migrate and only run generate?
Your code will crash! 💥

Your application code will be updated to expect a new table or field, but that table or field won't exist in the database.

The Prisma Client will try to perform a query on a non-existent table, leading to a database error.

What if you make manual changes directly to the database?
This causes a schema drift. It's a bad practice 🚫.

To fix it, you need to use npx prisma db pull to update your schema.prisma file, then use npx prisma migrate dev to reset your migration history and create a new, clean migration from the current database state.

The migrate dev command will prompt you to reset your database, which will delete all your data.

Why db pull creates a schema drift
prisma db pull only updates your local schema.prisma file to match the database.

It does not create a new migration file to record this change in your project's history.

The database now has an extra column, but the migration history says it doesn't.

Prisma detects this inconsistency as a "drift" and can't proceed, as it doesn't have a clear, version-controlled path to the current database state.




Perfect 👍 Let’s set up the backend folder structure and then build the first API: signup/login with JWT auth.

1. Folder Structure

Inside backend/ create this layout:

backend/
 ├── src/
 │    ├── index.ts         # Entry point
 │    ├── routes/
 │    │     ├── auth.ts    # Auth routes (login/signup)
 │    │     ├── camera.ts  # Camera CRUD routes
 │    │     └── alert.ts   # Alerts routes
 │    ├── lib/
 │    │     └── prisma.ts  # Prisma client helper
 │    └── middleware/
 │          └── auth.ts    # JWT auth middleware
 ├── prisma/
 │    └── schema.prisma    # Prisma schema (done earlier)
 ├── package.json
 ├── tsconfig.json
 └── .env

2. Install Dependencies

Run inside backend/:

# Install Hono framework (like Express but lightweight)
npm install hono  

# Prisma client for DB queries
npm install @prisma/client  

# JWT library for authentication
npm install jsonwebtoken  

# Password hashing (bcrypt)
npm install bcryptjs  

# Types for TypeScript
npm install -D @types/jsonwebtoken @types/bcryptjs ts-node typescript nodemon  


👉 What these do:

hono → framework for routing/middleware

@prisma/client → Prisma client for DB access

jsonwebtoken → for JWT signing/verification

bcryptjs → secure password hashing

nodemon → auto-restarts server in dev mode

ts-node + typescript → TypeScript support

3. Prisma Client Helper

Create backend/src/lib/prisma.ts:

// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Create one Prisma client instance for whole app
const prisma = new PrismaClient();

export default prisma;

4. JWT Auth Middleware

Create backend/src/middleware/auth.ts:

// src/middleware/auth.ts
import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // Secret key

// Middleware to protect routes
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization"); // Get Authorization header
    if (!authHeader) return c.text("Unauthorized", 401);

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Attach userId to context for later use
    c.set("userId", decoded.userId);
    await next();
  } catch (err) {
    return c.text("Invalid or expired token", 401);
  }
};

5. Auth Routes (Signup + Login)

Create backend/src/routes/auth.ts:

// src/routes/auth.ts
import { Hono } from "hono";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Signup route
auth.post("/signup", async (c) => {
  const { username, password } = await c.req.json();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in DB
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  return c.json({ message: "User created", userId: user.id });
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

6. Main Entry Point

Create backend/src/index.ts:

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
serve(app, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

7. Run the Server
# Start Prisma client
npx prisma generate  

# Start server in dev mode
npx nodemon src/index.ts  


👉 What these do:

npx prisma generate → creates Prisma client based on schema

npx nodemon src/index.ts → runs server and auto-restarts on changes

✅ At this point you have:

PostgreSQL DB

Prisma schema with User/Camera/Alert

Backend server running with signup/login (JWT auth)

Next step will be Camera CRUD APIs (so you can add/manage camera RTSP URLs).










---
---
---
---
---
------
---
---
---
---
------
---
---
---
---
------
---
---
---
---
---

Perfect! Let’s set up the Worker service step by step. I’ll explain what each part does, including commands and code comments.

Worker Service Overview

The worker will:

Connect to RTSP cameras.

Capture video frames using FFmpeg/OpenCV.

Run face detection on each frame.

Draw boxes around detected faces.

Push processed video to MediaMTX for WebRTC.

Send alerts (face detected + snapshot) to backend via API.

Handle reconnections if a camera goes offline.

Technologies used:

Go (Golang) → main language

GoCV (OpenCV binding) → video frame capture & processing

go-face → face detection library

MediaMTX → stream server for WebRTC

HTTP client → send alerts to backend



1. Setup Worker Project
# Go module init
cd worker/
go mod init worker

# Install GoCV (OpenCV bindings)
go get -u gocv.io/x/gocv

# Install Go-Face for face detection
go get github.com/Kagami/go-face

# HTTP requests (standard library net/http works)


Explanation:

go mod init worker → creates a Go module for dependency management

go get gocv.io/x/gocv → install OpenCV bindings

go get github.com/Kagami/go-face → face detection library





1. Worker Folder Structure

Inside your worker/ folder, create this:

worker/
 ├── main.go           # Entry point of the worker
 ├── cameras.go        # Handles reading camera streams
 ├── detector.go       # Face detection logic
 ├── alerts.go         # Sends alerts to backend
 ├── media.go          # Push frames to MediaMTX (WebRTC)
 ├── go.mod            # Go module (created by `go mod init worker`)
 └── go.sum            # Dependencies


✅ This keeps logic separate:

main.go → starts the worker and loops through all cameras

cameras.go → opens RTSP streams and reads frames

detector.go → detects faces on frames

alerts.go → posts alerts to backend

media.go → sends processed video to MediaMTX

2. Create main.go
package main

import "fmt"

func main() {
    fmt.Println("Worker starting...")

    // List of camera RTSP URLs
    cameras := []string{
        "rtsp://username:password@camera1_ip:554/stream",
        "rtsp://username:password@camera2_ip:554/stream",
    }

    // Loop through cameras and start streaming
    for _, url := range cameras {
        go StartCameraStream(url) // Start each camera in a separate goroutine
    }

    // Keep main alive
    select {}
}


Explanation:

StartCameraStream(url) → function in cameras.go that handles reading frames from RTSP

go StartCameraStream(url) → runs each camera concurrently

select {} → prevents program from exiting



Here, RTSP stands for Real Time Streaming Protocol. 📡

It's a network protocol used to control streaming media sessions between a client and a server. Think of it as a remote control for a video stream. It doesn't actually stream the video data itself; instead, it sends commands like "play," "pause," "record," and "stop" to a streaming server. The actual video and audio data are typically sent via a different protocol, most commonly RTP (Real-time Transport Protocol).

In your Go code, the string "rtsp://username:password@camera1_ip:554/stream" is a RTSP URL. This URL tells the StartCameraStream function where to find the camera's streaming server and how to authenticate to it, allowing your program to request and receive the live video feed.



