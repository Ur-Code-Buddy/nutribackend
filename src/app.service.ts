import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedPincode } from './common/entities/allowed-pincode.entity';
import { RedisService } from './redis/redis.service';

/** Redis value: missing = treat as under maintenance; "0" = off; else unix ms until maintenance ends */
const MAINTENANCE_UNTIL_KEY = 'nutri:maintenance_until';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AllowedPincode)
    private readonly pincodeRepo: Repository<AllowedPincode>,
    private readonly redisService: RedisService,
  ) { }

  async onModuleInit() {
    // Seed default pincodes if none exist
    const count = await this.pincodeRepo.count();
    if (count === 0) {
      const defaults = [605001, 605002, 605003];
      const entities = defaults.map(p => this.pincodeRepo.create({ pincode: p }));
      await this.pincodeRepo.save(entities);
    }
  }

  getHello(): string {
    return 'This is Nutri Tiffin!';
  }

  async isDistrictAvailable(pincode: string): Promise<boolean> {
    if (!pincode) return false;
    const pin = parseInt(pincode, 10);
    if (isNaN(pin)) return false;
    const result = await this.pincodeRepo.findOne({
      where: { pincode: pin, is_active: true }
    });
    return !!result;
  }

  async addPincode(pincode: number): Promise<AllowedPincode> {
    const existing = await this.pincodeRepo.findOne({ where: { pincode } });
    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        return this.pincodeRepo.save(existing);
      }
      return existing;
    }
    const nuevo = this.pincodeRepo.create({ pincode });
    return this.pincodeRepo.save(nuevo);
  }

  async removePincode(pincode: number): Promise<void> {
    await this.pincodeRepo.update({ pincode }, { is_active: false });
  }

  async getAllPincodes(): Promise<AllowedPincode[]> {
    return this.pincodeRepo.find();
  }

  getCharges() {
    return {
      platform_fees: Number(this.configService.get<number>('PLATFORM_FEES', 10)),
      kitchen_fees: Number(this.configService.get<number>('KITCHEN_FEES', 15)),
      delivery_fees: Number(this.configService.get<number>('DELIVERY_FEES', 20)),
    };
  }

  /**
   * No Redis key → under maintenance (true). Optional `hours` / `time` (> 0): true only if maintenance
   * stays on for at least that many more hours (ignored when there is no end time — stays true).
   */
  async getIsUnderMaintenance(hoursFilter?: string): Promise<{
    is_under_maintainance: boolean;
    maintenance_ends_at: string | null;
  }> {
    const raw = await this.redisService.client.get(MAINTENANCE_UNTIL_KEY);
    const endsAt = this.parseMaintenanceEndsAt(raw);
    let is_under_maintainance = this.computeUnderMaintenance(raw);
    const h = this.parseHoursQuery(hoursFilter);
    if (h != null && h > 0 && is_under_maintainance && raw != null && raw !== '0') {
      const until = parseInt(raw, 10);
      if (!Number.isNaN(until) && until > Date.now()) {
        const remainingMs = until - Date.now();
        is_under_maintainance = remainingMs >= h * 3600000;
      }
    }
    return {
      is_under_maintainance,
      maintenance_ends_at: endsAt,
    };
  }

  /**
   * POST: `hours` / `time` omitted → maintenance on with no scheduled end. `0` → off. Positive → on for N hours.
   */
  async setIsUnderMaintenance(hoursOrTime?: string): Promise<{
    is_under_maintainance: boolean;
    maintenance_ends_at: string | null;
  }> {
    const h = this.parseHoursQuery(hoursOrTime);
    if (h === 0) {
      await this.redisService.client.set(MAINTENANCE_UNTIL_KEY, '0');
      return { is_under_maintainance: false, maintenance_ends_at: null };
    }
    if (h != null && h > 0) {
      const until = Date.now() + h * 3600000;
      await this.redisService.client.set(MAINTENANCE_UNTIL_KEY, String(until));
      return {
        is_under_maintainance: true,
        maintenance_ends_at: new Date(until).toISOString(),
      };
    }
    const far = String(Date.now() + 100 * 365 * 24 * 3600000);
    await this.redisService.client.set(MAINTENANCE_UNTIL_KEY, far);
    return {
      is_under_maintainance: true,
      maintenance_ends_at: new Date(parseInt(far, 10)).toISOString(),
    };
  }

  private parseMaintenanceEndsAt(raw: string | null): string | null {
    if (raw == null || raw === '0') return null;
    const until = parseInt(raw, 10);
    if (Number.isNaN(until)) return null;
    return new Date(until).toISOString();
  }

  private computeUnderMaintenance(raw: string | null): boolean {
    if (raw == null) return true;
    if (raw === '0') return false;
    const until = parseInt(raw, 10);
    if (Number.isNaN(until)) return true;
    return Date.now() < until;
  }

  private parseHoursQuery(q?: string): number | null {
    if (q === undefined || q === null || String(q).trim() === '') return null;
    const n = parseFloat(String(q));
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  }
}
