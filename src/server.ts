import { PrismaClient } from "@prisma/client";
import { app } from "./app";
import { config } from "./configurations/config";
import { redisClient } from "./configurations/redis-client";
import prisma from "./database/PgDB";
import { socketInstance } from "./source/common/lib/sockets";

class CreateDBConnect {
  db: PrismaClient;
  constructor() {
    this.db = prisma;
  }
  async connect() {
    try {
      await redisClient
        .connect()
        .then(async () => {
          console.log("Redis client is ready and connected.");
          await this.db.$connect();
          console.log("Connected to database successfully");
          const server = app.listen(config.server.PORT, () =>
            console.log(`Server is running on port ${config.server.PORT}`)
          );
          socketInstance.initialize(server);
          server.keepAliveTimeout = 600 * 1000;
          server.headersTimeout = 65 * 1000;
        })
        .catch((err) => {
          console.error("Redis connection error:", err);
        });
    } catch (error: any) {
      console.error("Failed to connect to database", error.message);
    }
  }
  async disconnect() {
    await this.db.$disconnect();
  }
}
const dbConnect = new CreateDBConnect();
dbConnect.connect();
