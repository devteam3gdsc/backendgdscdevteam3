import { Server } from "socket.io";

export const onlineUsers = new Map();
let io; // Declare io variable

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "https://sks564-5173.csb.app",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`New socket connection established: ${socket.id}`);

    socket.on("userConnected", (userId) => {
      if (!userId) {
        console.error("userId is required for userConnected event");
        return;
      }
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
        }
      });

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} disconnected`);
      } else {
        console.log(`Socket ID ${socket.id} disconnected, but no user was associated`);
      }
    });
  });

  return io;
};

// Export io and onlineUsers
export { io };
