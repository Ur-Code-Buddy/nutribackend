import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { FoodItem } from '../../food-items/entities/food-item.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column()
    food_item_id: string;

    @ManyToOne(() => FoodItem)
    @JoinColumn({ name: 'food_item_id' })
    food_item: FoodItem;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    snapshot_price: number;
}
