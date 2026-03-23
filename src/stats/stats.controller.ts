import { Controller, Get } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ForceThrottle } from '../common/decorators/force-throttle.decorator';
import { StatsService } from './stats.service';

// `v1/stats` — path after reverse proxies that strip `/api` from the public URL
// (`https://host/api/v1/stats/public` → upstream GET `/v1/stats/public`)
@Controller(['api/v1/stats', 'v1/stats'])
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('public')
  @SkipThrottle({ default: true, hourly: true })
  @ForceThrottle()
  @Throttle({ publicStats: { limit: 20, ttl: 60000 } })
  getPublic() {
    return this.statsService.getPublicStats();
  }
}
