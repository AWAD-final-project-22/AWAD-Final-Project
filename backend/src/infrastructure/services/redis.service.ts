import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      const redisHost = this.configService.get<string>('REDIS_HOST');
      const redisPort = this.configService.get<number>('REDIS_PORT');
      const redisUsername = this.configService.get<string>('REDIS_USERNAME');
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      let connectionOptions: any;

      // If REDIS_URL is provided, use it (supports redis:// or rediss://)
      if (redisUrl) {
        connectionOptions = redisUrl;
        this.logger.log('Using REDIS_URL for connection');
      } 
      // Otherwise, use individual config (for Redis Cloud)
      else if (redisHost && redisPort) {
        connectionOptions = {
          host: redisHost,
          port: redisPort,
          username: redisUsername || 'default',
          password: redisPassword,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        };
        this.logger.log(`Using Redis Cloud connection: ${redisHost}:${redisPort}`);
      } 
      // Fallback to localhost
      else {
        connectionOptions = 'redis://localhost:6379';
        this.logger.warn('No Redis config found, using default localhost:6379');
      }

      this.client = new Redis(connectionOptions);

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      // Test connection
      await this.client.ping();
      this.logger.log('Redis ping successful');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  getConnectionOptions(): 
    | string 
    | { 
        host: string; 
        port: number; 
        username?: string;
        password?: string; 
        db?: number;
      } {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisUsername = this.configService.get<string>('REDIS_USERNAME');
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    // If REDIS_URL is provided, return as string (BullMQ can handle it)
    if (redisUrl) {
      return redisUrl;
    }
    
    // Otherwise, return options object (for Redis Cloud)
    if (redisHost && redisPort) {
      return {
        host: redisHost,
        port: redisPort,
        username: redisUsername || 'default',
        password: redisPassword,
      };
    }
    
    // Fallback to default
    return {
      host: 'localhost',
      port: 6379,
    };
  }
}
