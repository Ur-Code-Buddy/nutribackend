import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.redisClient = new Redis({
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            tls: this.configService.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
        });

        this.redisClient.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        this.redisClient.on('error', (err) => {
            this.logger.error('Redis connection error', err);
        });
    }

    onModuleDestroy() {
        this.redisClient.disconnect();
    }

    get client() {
        return this.redisClient;
    }

    async ping(): Promise<string> {
        try {
            return await this.redisClient.ping();
        } catch (error) {
            throw error;
        }
    }
}
