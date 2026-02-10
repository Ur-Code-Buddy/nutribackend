import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { FoodItem } from './food-item.entity';

@Entity('food_item_availability')
export class FoodItemAvailability {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    food_item_id: string;

    @ManyToOne(() => FoodItem, (item) => item.availability)
    @JoinColumn({ name: 'food_item_id' })
    food_item: FoodItem;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ default: false })
    is_available: boolean; // False means unavailable/sold out for that day

    @CreateDateColumn()
    created_at: Date;
}
