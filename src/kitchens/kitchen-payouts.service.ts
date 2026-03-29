import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrevoClient } from '@getbrevo/brevo';
import { KitchenBankDetails } from './entities/kitchen-bank-details.entity';
import { KitchensService } from './kitchens.service';
import { UsersService } from '../users/users.service';
import { UpsertKitchenBankDetailsDto } from './dto/upsert-kitchen-bank-details.dto';
import { KitchenWithdrawDto } from './dto/kitchen-withdraw.dto';

const PAYOUTS_EMAIL = 'payouts@nutritiffin.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMinKitchenWithdrawalInr(
  configService: ConfigService,
): number {
  const raw = configService.get<string>('MIN_KITCHEN_WITHDRAWAL_INR');
  if (raw === undefined || String(raw).trim() === '') {
    throw new InternalServerErrorException(
      'MIN_KITCHEN_WITHDRAWAL_INR is not configured',
    );
  }
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new InternalServerErrorException(
      'MIN_KITCHEN_WITHDRAWAL_INR must be a positive number',
    );
  }
  return n;
}

async function sendWithdrawalRequestEmail(params: {
  kitchenName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string | null;
  amountInr: number;
  bank: KitchenBankDetails;
  note?: string;
}): Promise<void> {
  const {
    kitchenName,
    ownerName,
    ownerEmail,
    ownerPhone,
    amountInr,
    bank,
    note,
  } = params;

  if (process.env.PRODUCTION === 'false') {
    console.log(
      `[DEV MODE] Withdrawal request email would be sent to ${PAYOUTS_EMAIL} for kitchen "${kitchenName}", amount ₹${amountInr}`,
    );
    return;
  }

  const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY as string,
  });

  const upiLine = bank.upi_id
    ? `<p><strong>UPI ID:</strong> ${escapeHtml(bank.upi_id)}</p>`
    : '<p><strong>UPI ID:</strong> (not provided)</p>';

  const noteBlock = note
    ? `<p><strong>Note from kitchen:</strong> ${escapeHtml(note)}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Withdrawal Request</title></head>
      <body style="font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6;">
        <h2>Kitchen withdrawal request</h2>
        <p><strong>Kitchen:</strong> ${escapeHtml(kitchenName)}</p>
        <p><strong>Owner name:</strong> ${escapeHtml(ownerName)}</p>
        <p><strong>Registered email:</strong> ${escapeHtml(ownerEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(ownerPhone || '—')}</p>
        <p><strong>Amount to credit (INR):</strong> ₹${amountInr.toFixed(2)}</p>
        <hr />
        <h3>Bank details</h3>
        <p><strong>Account holder:</strong> ${escapeHtml(bank.account_holder_name)}</p>
        <p><strong>Account number:</strong> ${escapeHtml(bank.account_number)}</p>
        <p><strong>IFSC:</strong> ${escapeHtml(bank.ifsc_code)}</p>
        <p><strong>Bank name:</strong> ${escapeHtml(bank.bank_name)}</p>
        ${upiLine}
        ${noteBlock}
      </body>
    </html>
  `;

  const subjectKitchen = kitchenName.replace(/[\r\n]/g, ' ').trim().slice(0, 200);

  await client.transactionalEmails.sendTransacEmail({
    subject: `Withdrawal Request – ${subjectKitchen}`,
    htmlContent: html,
    sender: {
      name: 'NutriTiffin',
      email: 'nutritiffin.kitchen@gmail.com',
    },
    to: [{ email: PAYOUTS_EMAIL }],
  });
}

@Injectable()
export class KitchenPayoutsService {
  constructor(
    @InjectRepository(KitchenBankDetails)
    private readonly bankDetailsRepo: Repository<KitchenBankDetails>,
    private readonly kitchensService: KitchensService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  private async requireKitchenForOwner(ownerId: string) {
    const kitchen = await this.kitchensService.findByOwner(ownerId);
    if (!kitchen) {
      throw new NotFoundException('No kitchen found for this account');
    }
    return kitchen;
  }

  async getBankDetailsForOwner(ownerId: string) {
    const kitchen = await this.requireKitchenForOwner(ownerId);
    const row = await this.bankDetailsRepo.findOne({
      where: { kitchen_id: kitchen.id },
    });
    return row;
  }

  async upsertBankDetails(ownerId: string, dto: UpsertKitchenBankDetailsDto) {
    const kitchen = await this.requireKitchenForOwner(ownerId);
    let row = await this.bankDetailsRepo.findOne({
      where: { kitchen_id: kitchen.id },
    });
    if (!row) {
      row = this.bankDetailsRepo.create({
        kitchen_id: kitchen.id,
        account_holder_name: dto.account_holder_name,
        account_number: dto.account_number,
        ifsc_code: dto.ifsc_code,
        bank_name: dto.bank_name,
        upi_id: dto.upi_id?.trim() ? dto.upi_id.trim() : null,
      });
    } else {
      row.account_holder_name = dto.account_holder_name;
      row.account_number = dto.account_number;
      row.ifsc_code = dto.ifsc_code;
      row.bank_name = dto.bank_name;
      row.upi_id = dto.upi_id?.trim() ? dto.upi_id.trim() : null;
    }
    return this.bankDetailsRepo.save(row);
  }

  async requestWithdraw(ownerId: string, dto: KitchenWithdrawDto) {
    const minInr = parseMinKitchenWithdrawalInr(this.configService);
    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount < minInr) {
      throw new BadRequestException(
        `Withdrawal amount must be at least ₹${minInr.toFixed(2)}`,
      );
    }

    const kitchen = await this.requireKitchenForOwner(ownerId);
    const bank = await this.bankDetailsRepo.findOne({
      where: { kitchen_id: kitchen.id },
    });
    if (!bank) {
      throw new BadRequestException(
        'Add your bank details before requesting a withdrawal',
      );
    }

    const user = await this.usersService.findOneById(ownerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const credits = Number(user.credits);
    if (!Number.isFinite(credits) || credits < amount) {
      throw new BadRequestException('Insufficient credit balance');
    }

    const ownerEmail = user.email;
    const ownerPhone = user.phone_number;
    const ownerName = user.name;
    const kitchenName = kitchen.name;

    try {
      await sendWithdrawalRequestEmail({
        kitchenName,
        ownerName,
        ownerEmail,
        ownerPhone,
        amountInr: amount,
        bank,
        note: dto.note,
      });
    } catch (err: unknown) {
      console.error('[EMAIL ERROR] Kitchen withdrawal request email failed', err);
      throw new InternalServerErrorException(
        'Could not submit withdrawal request. Please try again later.',
      );
    }

    return {
      message:
        'Withdrawal request submitted. Our team will process the payout manually.',
    };
  }
}
