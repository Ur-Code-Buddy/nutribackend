import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Kitchen } from '../../kitchens/entities/kitchen.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    client_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'client_id' })
    client: User;

    @Column()
    kitchen_id: string;

    @ManyToOne(() => Kitchen)
    @JoinColumn({ name: 'kitchen_id' })
    kitchen: Kitchen;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'date' })
    scheduled_for: string; // YYYY-MM-DD

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
