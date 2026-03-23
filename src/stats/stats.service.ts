import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user.role.enum';
import { Kitchen } from '../kitchens/entities/kitchen.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { RedisService } from '../redis/redis.service';

export interface PublicStatsPayload {
  number_of_active_clients: number;
  number_of_active_kitchens: number;
  number_of_active_delivery_partners: number;
  number_of_orders_fulfilled: number;
  as_of: string;
}

const CACHE_KEY = 'stats:public:v1';
const LOCK_KEY = 'stats:public:v1:lock';
const CACHE_TTL_SEC = 15 * 60;
const LOCK_TTL_SEC = 30;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const LOCK_WAIT_MS = 100;
const LOCK_WAIT_ATTEMPTS = 40;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

@Injectable()
export class StatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StatsService.name);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Kitchen)
    private readonly kitchenRepo: Repository<Kitchen>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  onModuleInit() {
    void this.refreshPublicStatsCache().catch((err) =>
      this.logger.warn('Initial public stats warm-up failed', err),
    );
    this.refreshTimer = setInterval(() => {
      void this.refreshPublicStatsCache().catch((err) =>
        this.logger.warn('Scheduled public stats refresh failed', err),
      );
    }, REFRESH_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async getPublicStats(): Promise<PublicStatsPayload> {
    try {
      const cached = await this.redisService.client.get(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as PublicStatsPayload;
      }
    } catch (err) {
      this.logger.warn(
        'Redis read failed for public stats; computing live',
        err,
      );
    }

    return this.recomputeWithSingleFlight();
  }

  /** Background job / startup: refresh cache without serving. */
  async refreshPublicStatsCache(): Promise<void> {
    const payload = await this.computeCounts();
    try {
      await this.redisService.client.set(
        CACHE_KEY,
        JSON.stringify(payload),
        'EX',
        CACHE_TTL_SEC,
      );
    } catch (err) {
      this.logger.warn('Redis write failed for public stats cache', err);
    }
  }

  private async recomputeWithSingleFlight(): Promise<PublicStatsPayload> {
    let lockAcquired = false;
    try {
      const setResult = await this.redisService.client.set(
        LOCK_KEY,
        '1',
        'EX',
        LOCK_TTL_SEC,
        'NX',
      );
      lockAcquired = setResult === 'OK';
    } catch (err) {
      this.logger.warn(
        'Redis lock failed for public stats; computing live',
        err,
      );
      return this.computeCounts();
    }

    if (lockAcquired) {
      try {
        const payload = await this.computeCounts();
        try {
          await this.redisService.client.set(
            CACHE_KEY,
            JSON.stringify(payload),
            'EX',
            CACHE_TTL_SEC,
          );
        } catch (err) {
          this.logger.warn(
            'Redis write failed after public stats compute',
            err,
          );
        }
        return payload;
      } finally {
        try {
          await this.redisService.client.del(LOCK_KEY);
        } catch {
          /* ignore */
        }
      }
    }

    for (let i = 0; i < LOCK_WAIT_ATTEMPTS; i++) {
      await sleep(LOCK_WAIT_MS);
      try {
        const cached = await this.redisService.client.get(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached) as PublicStatsPayload;
        }
      } catch {
        break;
      }
    }

    return this.computeCounts();
  }

  private async computeCounts(): Promise<PublicStatsPayload> {
    const as_of = new Date().toISOString();

    const [
      number_of_active_clients,
      number_of_active_kitchens,
      number_of_active_delivery_partners,
      number_of_orders_fulfilled,
    ] = await Promise.all([
      this.userRepo.count({
        where: {
          role: UserRole.CLIENT,
          is_active: true,
          is_banned: false,
        },
      }),
      this.kitchenRepo.count({ where: { is_active: true } }),
      this.userRepo.count({
        where: {
          role: UserRole.DELIVERY_DRIVER,
          is_active: true,
          is_banned: false,
        },
      }),
      this.orderRepo.count({ where: { status: OrderStatus.DELIVERED } }),
    ]);

    return {
      number_of_active_clients,
      number_of_active_kitchens,
      number_of_active_delivery_partners,
      number_of_orders_fulfilled,
      as_of,
    };
  }
}
