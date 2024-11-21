import { Redis } from '@upstash/redis';

import { singleton } from './singleton';

const createRedis = () => {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redis;
};

export const redis = singleton('redis', createRedis);
