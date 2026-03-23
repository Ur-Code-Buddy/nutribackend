import { SetMetadata } from '@nestjs/common';

/** When set, CustomThrottlerGuard enforces throttling even if PRODUCTION=false. */
export const FORCE_THROTTLE_KEY = 'nutri:forceThrottle';

export const ForceThrottle = () => SetMetadata(FORCE_THROTTLE_KEY, true);
