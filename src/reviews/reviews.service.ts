import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { FoodItem } from '../food-items/entities/food-item.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepo: Repository<Review>,
        @InjectRepository(OrderItem)
        private orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
        @InjectRepository(FoodItem)
        private foodItemRepo: Repository<FoodItem>,
    ) { }

    async create(clientId: string, dto: CreateReviewDto) {
        // 1. Find the order item and its parent order
        const orderItem = await this.orderItemRepo.findOne({
            where: { id: dto.order_item_id },
            relations: ['order'],
        });

        if (!orderItem) {
            throw new NotFoundException('Order item not found');
        }

        const order = orderItem.order;

        // 2. Verify the order belongs to this client
        if (order.client_id !== clientId) {
            throw new BadRequestException('This order does not belong to you');
        }

        // 3. Verify the order is delivered
        if (order.status !== OrderStatus.DELIVERED) {
            throw new BadRequestException(
                'You can only review items from delivered orders',
            );
        }

        // 4. Verify within 24-hour window after delivery
        if (!order.delivered_at) {
            throw new BadRequestException('Delivery time not recorded');
        }

        const now = new Date();
        const deliveredAt = new Date(order.delivered_at);
        const hoursSinceDelivery =
            (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceDelivery > 24) {
            throw new BadRequestException(
                'Review window has expired. You can only review within 24 hours of delivery.',
            );
        }

        // 5. Check if already reviewed (unique constraint will also catch this, but better UX with clear message)
        const existing = await this.reviewsRepo.findOne({
            where: {
                client_id: clientId,
                order_item_id: dto.order_item_id,
            },
        });

        if (existing) {
            throw new ConflictException(
                'You have already reviewed this item for this order',
            );
        }

        // 6. Create the review
        const review = this.reviewsRepo.create({
            client_id: clientId,
            kitchen_id: order.kitchen_id,
            food_item_id: orderItem.food_item_id,
            order_id: order.id,
            order_item_id: orderItem.id,
            is_positive: dto.is_positive,
        });

        const savedReview = await this.reviewsRepo.save(review);

        // 7. Increment the count on the food item
        if (dto.is_positive) {
            await this.foodItemRepo.increment(
                { id: orderItem.food_item_id },
                'positive_count',
                1,
            );
        } else {
            await this.foodItemRepo.increment(
                { id: orderItem.food_item_id },
                'negative_count',
                1,
            );
        }

        return savedReview;
    }

    async findByFoodItem(foodItemId: string) {
        return this.reviewsRepo.find({
            where: { food_item_id: foodItemId },
            order: { created_at: 'DESC' },
        });
    }

    async findByKitchen(kitchenId: string) {
        return this.reviewsRepo.find({
            where: { kitchen_id: kitchenId },
            order: { created_at: 'DESC' },
        });
    }

    async findMyReviews(clientId: string) {
        return this.reviewsRepo.find({
            where: { client_id: clientId },
            relations: ['food_item'],
            order: { created_at: 'DESC' },
        });
    }
}
