import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kitchen } from './kitchen.entity';

@Entity('kitchen_bank_details')
export class KitchenBankDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  kitchen_id: string;

  @ManyToOne(() => Kitchen, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kitchen_id' })
  kitchen: Kitchen;

  @Column()
  account_holder_name: string;

  @Column()
  account_number: string;

  @Column()
  ifsc_code: string;

  @Column()
  bank_name: string;

  @Column({ type: 'varchar', nullable: true })
  upi_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
