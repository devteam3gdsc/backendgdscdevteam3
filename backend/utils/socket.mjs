import { Server } from "socket.io";
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";

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

  io.use(authMiddleware.verifySocketToken); // Xác thực trước khi kết nối

  io.on("connection", (socket) => {
    console.log(
      `New socket connection: ${socket.id}, User ID: ${socket.userId}`,
    );

    // Gửi phản hồi cho FE xác nhận kết nối thành công
    socket.emit("connection_success", {
      message: "Connected to server successfully!",
      socketId: socket.id,
      userId: socket.userId, // Gửi luôn userId về FE
    });

    // Lưu userId vào danh sách online
    onlineUsers.set(socket.userId, socket.id);
    console.log(`User ${socket.userId} connected with socket ID ${socket.id}`);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    });

    socket.on("getNotifications", async () => {
      console.log(`User ${socket.userId} requested notifications`);

      const notifications = await Notification.find({ userId: socket.userId })
        .sort({ createdAt: -1 })
        .limit(10);

      socket.emit("notifications", notifications);
    });
  });

  return io;
};

export { io };
