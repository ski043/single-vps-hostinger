import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

type RedisGlobal = typeof globalThis & {
  redisClient?: RedisClient;
  redisClientPromise?: Promise<RedisClient>;
};

function createRedis() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy(retries) {
        return Math.min(retries * 50, 1000);
      },
    },
  });

  client.on("error", (error) => {
    console.error("Redis client error", error);
  });

  return client;
}

export async function getRedisClient() {
  const redisGlobal = globalThis as RedisGlobal;

  if (redisGlobal.redisClient?.isOpen) {
    return redisGlobal.redisClient;
  }

  if (!redisGlobal.redisClientPromise) {
    const client = redisGlobal.redisClient ?? createRedis();

    if (!client) {
      return null;
    }

    redisGlobal.redisClient = client;
    redisGlobal.redisClientPromise = client.connect().then(() => client);
  }

  return redisGlobal.redisClientPromise;
}
