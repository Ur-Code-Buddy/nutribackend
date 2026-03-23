import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionSource,
} from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

/** Helper: generate a short alphanumeric ID like "TXN-A1B2C3" */
function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-${result}`;
}

export interface CreateTransactionOpts {
  fromUserId?: string | null;
  toUserId?: string | null;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  description: string;
  referenceId?: string | null;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private txnRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // ──────────────────────────────────────────────────────────
  //  Core: record a transaction (called internally by other services)
  // ──────────────────────────────────────────────────────────

  async recordTransaction(opts: CreateTransactionOpts): Promise<Transaction> {
    const txn = this.txnRepo.create({
      short_id: generateShortId(),
      from_user_id: opts.fromUserId ?? null,
      to_user_id: opts.toUserId ?? null,
      amount: opts.amount,
      type: opts.type,
      source: opts.source,
      description: opts.description,
      reference_id: opts.referenceId ?? null,
    });
    return this.txnRepo.save(txn);
  }

  // ──────────────────────────────────────────────────────────
  //  Admin: add credits + log transaction
  // ──────────────────────────────────────────────────────────

  async addCredits(
    adminUserId: string,
    targetUsername: string,
    amount: number,
  ): Promise<{ user: User; transaction: Transaction }> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { username: targetUsername },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException(
          `User with username '${targetUsername}' not found`,
        );
      }

      user.credits = Number(user.credits) + Number(amount);
      const savedUser = await manager.save(user);

      const txn = manager.create(Transaction, {
        short_id: generateShortId(),
        from_user_id: null, // from SUPPORT (system)
        to_user_id: user.id,
        amount,
        type: TransactionType.CREDIT,
        source: TransactionSource.SUPPORT,
        description: `Credits added by SUPPORT`,
      });
      const savedTxn = await manager.save(txn);

      return { user: savedUser, transaction: savedTxn };
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Admin: deduct credits + log transaction
  // ──────────────────────────────────────────────────────────

  async deductCredits(
    adminUserId: string,
    targetUsername: string,
    amount: number,
  ): Promise<{ user: User; transaction: Transaction }> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { username: targetUsername },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException(
          `User with username '${targetUsername}' not found`,
        );
      }

      if (Number(user.credits) < Number(amount)) {
        throw new NotFoundException('Insufficient credits');
      }

      user.credits = Number(user.credits) - Number(amount);
      const savedUser = await manager.save(user);

      const txn = manager.create(Transaction, {
        short_id: generateShortId(),
        from_user_id: user.id, // deducted from this user
        to_user_id: null, // to SUPPORT (system)
        amount,
        type: TransactionType.DEBIT,
        source: TransactionSource.SUPPORT,
        description: `Credits deducted by SUPPORT`,
      });
      const savedTxn = await manager.save(txn);

      return { user: savedUser, transaction: savedTxn };
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Delivery payout: kitchen gets paid for a delivery
  // ──────────────────────────────────────────────────────────

  async recordDeliveryPayout(
    kitchenOwnerId: string,
    driverId: string,
    amount: number,
    orderShortRef: string,
    orderId: string,
  ): Promise<Transaction> {
    return this.recordTransaction({
      fromUserId: null,
      toUserId: kitchenOwnerId,
      amount,
      type: TransactionType.CREDIT,
      source: TransactionSource.DELIVERY,
      description: `Kitchen payout for delivery ${orderShortRef}`,
      referenceId: orderId,
    });
  }

  async recordDriverPayout(
    driverId: string,
    amount: number,
    orderShortRef: string,
    orderId: string,
  ): Promise<Transaction> {
    return this.recordTransaction({
      fromUserId: null,
      toUserId: driverId,
      amount,
      type: TransactionType.CREDIT,
      source: TransactionSource.DELIVERY,
      description: `Delivery payout for ${orderShortRef}`,
      referenceId: orderId,
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Order placement: client pays
  // ──────────────────────────────────────────────────────────

  async recordOrderPayment(
    clientId: string,
    amount: number,
    orderId: string,
  ): Promise<Transaction> {
    const shortRef = orderId.slice(0, 8).toUpperCase();
    return this.recordTransaction({
      fromUserId: clientId,
      toUserId: null,
      amount,
      type: TransactionType.DEBIT,
      source: TransactionSource.ORDER,
      description: `Order payment for ORD-${shortRef}`,
      referenceId: orderId,
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Queries: get transactions for a user
  // ──────────────────────────────────────────────────────────

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.txnRepo.findAndCount({
      where: [{ from_user_id: userId }, { to_user_id: userId }],
      relations: ['from_user', 'to_user'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit };
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.txnRepo.findAndCount({
      relations: ['from_user', 'to_user'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Transaction> {
    const txn = await this.txnRepo.findOne({
      where: { id },
      relations: ['from_user', 'to_user'],
    });
    if (!txn) throw new NotFoundException('Transaction not found');
    return txn;
  }
}
