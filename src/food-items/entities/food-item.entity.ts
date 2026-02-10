import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Kitchen } from '../../kitchens/entities/kitchen.entity';
import { FoodItemAvailability } from './food-item-availability.entity';

@Entity('food_items')
export class FoodItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    kitchen_id: string;

    @ManyToOne(() => Kitchen, (kitchen) => kitchen.food_items)
    @JoinColumn({ name: 'kitchen_id' })
    kitchen: Kitchen;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    image_url: string;

    @Column({ default: 100 })
    max_daily_orders: number;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => FoodItemAvailability, (avail) => avail.food_item)
    availability: FoodItemAvailability[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
