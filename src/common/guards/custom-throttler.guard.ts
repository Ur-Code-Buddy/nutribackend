import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FORCE_THROTTLE_KEY } from '../decorators/force-throttle.decorator';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const forceThrottle = this.reflector.getAllAndOverride<boolean>(
      FORCE_THROTTLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (forceThrottle) {
      return super.shouldSkip(context);
    }

    const isProd = process.env.PRODUCTION !== 'false';
    if (!isProd) {
      return true;
    }

    return super.shouldSkip(context);
  }
}
