import * as redis from "redis";
import { config } from "./config";

export const redisClient = redis.createClient({
  url: config.server.REDIS_URL,
})
