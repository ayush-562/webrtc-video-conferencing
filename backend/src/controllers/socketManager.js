import { Server as SocketServer } from "socket.io";

const connections = {};
const messages = {};
const timeOnline = {};
const MAX_MESSAGES_PER_ROOM = 50; // Prevent memory issues


export const connectToSocketServer = (server) => {
    if (!server) {
        throw new Error('Server instance is required');
    }
    const io = new SocketServer(server, {
        cors: {
            origin: "*",  // Allow all origins in testing. In production, you should restrict this to your frontend URL.
            // origin: process.env.FRONTEND_URL, // Uncomment this line for production use
            // origin: process.env.ALLOWED_ORIGINS.split(','), // For multiple allowed origins
            // origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS.split(',') : "*",
            
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["*"],
            // allowedHeaders: ["Content-Type", "Authorization"],
            // maxAge: 86400 // 24 hours
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId) => {  // Listens for a user joining
            if (!roomId || typeof roomId !== "string") return;

            if (!connections[roomId]) {  //If this room doesn't exist in the connections object
                connections[roomId] = new Set();    // initialize with empty Set (only unique values)
            }

            // Add the joining user's socket ID to the list of users in the room
            connections[roomId].add(socket.id);

            // Join the Socket.IO room
            socket.join(roomId);

            // Stores the time this user joined — useful for call duration tracking
            timeOnline[socket.id] = new Date();

            // Notifies all users in the room that a new user has joined
            const userList = Array.from(connections[roomId]);

            // Broadcast to all users in the room using Socket.IO's built-in room feature
            io.to(roomId).emit("user-joined", socket.id, userList);

            // When a new user joins, they receive all past chat messages for that room.
            if (messages[roomId] !== undefined) {
                for (let a = 0; a < messages[roomId].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[roomId][a]['data'],
                        messages[roomId][a]['sender'], messages[roomId][a]['socket-id-sender']);
                }
            }

        });

        socket.on("signal", (toId, message) => {
            if (!toId || !message) return;
            io.to(toId).emit("signal", socket.id, message);
        });


        socket.on("chat-message", (data, sender) => {
            if (!data || typeof data !== "string" || !sender) return;

            // step - 1 : find the roomId the user is in
            const [roomId] = Object.entries(connections)
                .find(([_, sockets]) => sockets.has(socket.id)) || [];

            if (!roomId) return; // Socket not found in any room

            // step - 2 : store the message in the messages object
            if (!messages[roomId]) {
                messages[roomId] = [];
            }

            // Remove oldest message if limit reached
            if (messages[roomId].length >= MAX_MESSAGES_PER_ROOM) {
                messages[roomId].shift();
            }

            messages[roomId].push({
                data,
                sender,
                'socket-id-sender': socket.id,
                timestamp: new Date().toISOString()
            });

            console.log(`Message in room ${roomId} from ${sender}: ${data}`);

            // step - 3 : broadcast the message to all users in the room
            connections[roomId].forEach(socketId => {
                io.to(socketId).emit("chat-message", data, sender, socket.id);
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            // Calculate session duration
            const disconnectTime = new Date();
            const joinTime = timeOnline[socket.id];
            const duration = joinTime ? Math.abs(disconnectTime - joinTime) : 0;

            // Find the room this socket was part of using the same pattern as chat-message
            const [roomId] = Object.entries(connections)
                .find(([_, sockets]) => sockets.has(socket.id)) || [];

            if (roomId) {
                // Remove user from the room
                connections[roomId].delete(socket.id);

                // Notify others in the room
                connections[roomId].forEach(socketId => {
                    io.to(socketId).emit("user-left", socket.id);
                });

                // If room is empty, clean up room data
                if (connections[roomId].size === 0) {
                    delete connections[roomId];
                    delete messages[roomId];
                    console.log(`Room ${roomId} cleaned up - no users remaining`);
                }
            }

            // Clean up user's session data
            delete timeOnline[socket.id];
            
            console.log(`User session ended. Duration: ${Math.floor(duration / 1000)} seconds`);
        });
    });

    return io;
};