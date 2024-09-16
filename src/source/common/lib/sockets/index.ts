import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { redisClient } from "../../../../configurations/redis-client";


interface ConnectedUsers {
  [userId: string]: string;
}
interface CorsOptions {
  origin: string;
  methods: string[];
  credentials: boolean;
}

class ISocketConnection {
  io!: Server;
  connectedUsers: ConnectedUsers = {};

  constructor(private corsOptions: CorsOptions) {}

  private handleUserLogin(socket: Socket, userId: string): void {
    try {
      this.connectedUsers[userId] = socket.id;
      console.log(`User ${userId} logged in. Socket ID: ${socket.id}`);
    } catch (error) {
      console.error("Error during userLogin event:", error);
      socket.emit("userLoginError", { message: "Error during login" });
    }
  }

  private handleDisconnect(socket: Socket): void {
    try {
      console.log(`⚡: ${socket.id} device just disconnected!`);
      const disconnectedStudent = Object.entries(this.connectedUsers).find(
        ([_, socketId]) => socketId === socket.id
      );

      if (disconnectedStudent) {
        const userId = Object.keys(this.connectedUsers).find(
          (id) => this.connectedUsers[id] === socket.id
        );

        if (userId) {
          console.log(`The user with id ${userId} is out`);
          delete this.connectedUsers[userId];
        }
      }
    } catch (error) {
      console.error("Error during disconnect event:", error);
      socket.emit("disconnectError", { message: "Error during disconnect" });
    }
  }

  initialize(server: any): void {
    this.io = new Server(server, {
      cors: this.corsOptions,
      adapter: createAdapter(redisClient),
    });
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    this.io.on("connection", async (socket: Socket) => {
      socket.on("userLogin", (userId: string) => this.handleUserLogin(socket, userId));

      console.log(`⚡: ${socket.id} device just connected!`);

      socket.on("disconnect", async () => this.handleDisconnect(socket));
    });
  }
}

export const socketInstance = new ISocketConnection({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
});

export const getIO = (): Server => socketInstance.io;
export const getConnectedUsers = (): ConnectedUsers => socketInstance.connectedUsers;
