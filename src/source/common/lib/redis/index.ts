import * as redis from "redis";
import { config } from "../../../../configurations/config";


export class IRedis {
  private redisClient = redis.createClient({
    url: config.server.REDIS_URL,
  });

  connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.redisClient.on("connect", () => {
        resolve();
      });

    });
  }

  disconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.redisClient.quit();
      resolve();
    });
  }
}
