import { BadRequestException } from '@nestjs/common';

/** Same window as order creation: 1–3 calendar days from today. */
export function assertValidOrderScheduledFor(scheduledFor: string): void {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 3);
  maxDate.setHours(23, 59, 59, 999);

  const scheduledDate = new Date(scheduledFor);
  const comparisonDate = new Date(scheduledDate);
  comparisonDate.setHours(0, 0, 0, 0);

  if (comparisonDate < minDate || comparisonDate > maxDate) {
    throw new BadRequestException(
      'Orders must be placed for 1 to 3 days in advance.',
    );
  }
}
