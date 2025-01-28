import { Server } from "socket.io";
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";

export const onlineUsers = new Map();
let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: `${process.env.FE_URL}`,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.headers.authorization?.split(" ")[1]; // Get token from headers
    if (token) {
      try {
        const verified = tokensAndCookies.accessTokenDecoding(token); // Xác thực token
        socket.user = verified;  // Lưu thông tin người dùng vào socket
        next();
      } catch (error) {
        return next(new Error("Unauthorized"));
      }
    } else {
      return next(new Error("Unauthorized"));
    }
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

  // socket.on("sendNotification", (data) => {
  //   console.log(`Notification received from user ${data.userId}: ${data.message}`);
  //   // Phát thông báo lại cho tất cả client
  //   io.emit("notificationEvent", { message: `Broadcast: ${data.message}` });
  // });
  return io;
};

export { io };
