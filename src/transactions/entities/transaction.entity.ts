import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * The type of credit transaction.
 *  CREDIT  = credits were added to `to_user`
 *  DEBIT   = credits were deducted from `from_user`
 */
export enum TransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

/**
 * Who / what initiated the transaction.
 *  SUPPORT   = An admin manually added/deducted credits
 *  DELIVERY  = Payment related to an order delivery
 *  ORDER     = Payment related to order placement / refund
 */
export enum TransactionSource {
    SUPPORT = 'SUPPORT',
    DELIVERY = 'DELIVERY',
    ORDER = 'ORDER',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Human-readable short ID, e.g. "TXN-A1B2C3".
     * Useful for display in lists & receipts.
     */
    @Column({ unique: true })
    short_id: string;

    // ── Parties ──────────────────────────────────────────────

    /** The user who sent / lost credits (null when SUPPORT adds credits) */
    @Column({ type: 'uuid', nullable: true })
    from_user_id: string | null;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'from_user_id' })
    from_user: User | null;

    /** The user who received credits (null when SUPPORT deducts credits) */
    @Column({ type: 'uuid', nullable: true })
    to_user_id: string | null;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'to_user_id' })
    to_user: User | null;

    // ── Amount & meta ────────────────────────────────────────

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionSource })
    source: TransactionSource;

    /** Short human-readable description, e.g. "Credits added by SUPPORT" or "Kitchen payout for DEL-X9K2" */
    @Column({ type: 'text' })
    description: string;

    /** Optional reference to a related order id */
    @Column({ type: 'uuid', nullable: true })
    reference_id: string | null;

    @CreateDateColumn()
    created_at: Date;
}
