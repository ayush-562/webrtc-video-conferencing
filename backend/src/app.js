import express from 'express';
import { createServer } from "node:http";
import { Server as SocketServer } from 'socket.io';
import cors from "cors";
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { connectToSocketServer } from './controllers/socketManager.js';
import userRoutes from "./routes/users.routes.js";

dotenv.config(); // Load .env before anything else

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

const start = async () => {
    try {
        await connectDB(); // Wait until DB is ready

        app.use("/api/v1/users", userRoutes);
        
        connectToSocketServer(server); // if it depends on DB, it’s safe now

        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}!`);
        });
    } catch (err) {
        console.error("Server startup failed:", err.message);
        process.exit(1);
    }
};

start();
