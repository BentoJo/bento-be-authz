import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client?: RedisClientType;

  private async ensureClient(): Promise<RedisClientType> {
    if (this.client) {
      return this.client;
    }

    const redisPass = process.env.REDIS_PASS;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (!redisHost || !redisPort) {
      throw new Error('Redis config missing');
    }

    this.client = createClient({
      username: 'default',
      password: redisPass,
      socket: {
        host: redisHost,
        port: parseInt(redisPort),
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await this.client.connect();
    console.log('✅ Redis connected');

    return this.client;
  }

  async onModuleInit() {
    await this.ensureClient();
  }

  getClient() {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    const client = await this.ensureClient();
    return client.set(key, value, { EX: ttlSeconds });
  }

  async get(key: string) {
    const client = await this.ensureClient();
    return client.get(key);
  }

  async del(key: string): Promise<void> {
    const client = await this.ensureClient();
    await client.del(key);
  }
}
