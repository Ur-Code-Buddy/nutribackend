import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemAvailability } from './entities/food-item-availability.entity';

import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { assertValidOrderScheduledFor } from '../common/utils/order-schedule';

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private foodItemRepo: Repository<FoodItem>,
    @InjectRepository(FoodItemAvailability)
    private foodItemAvailabilityRepo: Repository<FoodItemAvailability>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  create(createFoodItemDto: CreateFoodItemDto) {
    const item = this.foodItemRepo.create(createFoodItemDto);
    return this.foodItemRepo.save(item);
  }

  /** All items for a kitchen (kitchen owner / admin). */
  findAllByKitchen(kitchenId: string) {
    return this.foodItemRepo.find({ where: { kitchen_id: kitchenId } });
  }

  /** Client-facing menu: only items marked available in the kitchen panel. */
  async findAvailableByKitchen(
    kitchenId: string,
    scheduledFor?: string,
  ): Promise<(FoodItem & { remaining_daily_orders?: number })[]> {
    const items = await this.foodItemRepo.find({
      where: { kitchen_id: kitchenId, is_available: true },
    });
    if (!scheduledFor?.trim()) {
      return items;
    }
    const date = scheduledFor.trim();
    assertValidOrderScheduledFor(date);
    return this.attachRemainingToItems(items, kitchenId, date);
  }

  async findOne(id: string) {
    const item = await this.foodItemRepo.findOne({
      where: { id },
    });
    if (!item) throw new NotFoundException('Food item not found');
    return item;
  }

  async findOnePublic(
    id: string,
    scheduledFor?: string,
  ): Promise<FoodItem & { remaining_daily_orders?: number }> {
    const item = await this.foodItemRepo.findOne({
      where: { id, is_available: true },
    });
    if (!item) throw new NotFoundException('Food item not found');
    if (!scheduledFor?.trim()) {
      return item;
    }
    const date = scheduledFor.trim();
    assertValidOrderScheduledFor(date);
    const [withRemaining] = await this.attachRemainingToItems(
      [item],
      item.kitchen_id,
      date,
    );
    return withRemaining;
  }

  async update(id: string, updateFoodItemDto: UpdateFoodItemDto) {
    await this.foodItemRepo.update(id, updateFoodItemDto);
    return this.findOne(id);
  }

  async setAvailability(foodItemId: string, isAvailable: boolean) {
    await this.foodItemRepo.update(foodItemId, { is_available: isAvailable });
    return this.findOne(foodItemId);
  }

  private async getSoldQuantitiesForKitchenDate(
    kitchenId: string,
    foodItemIds: string[],
    scheduledFor: string,
  ): Promise<Map<string, number>> {
    if (foodItemIds.length === 0) {
      return new Map();
    }
    const rows = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .where('o.kitchen_id = :kitchenId', { kitchenId })
      .andWhere('o.scheduled_for = :date', { date: scheduledFor })
      .andWhere('o.status != :rejected', { rejected: OrderStatus.REJECTED })
      .andWhere('oi.food_item_id IN (:...ids)', { ids: foodItemIds })
      .select('oi.food_item_id', 'food_item_id')
      .addSelect('SUM(oi.quantity)', 'sold')
      .groupBy('oi.food_item_id')
      .getRawMany<{ food_item_id: string; sold: string | null }>();

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.food_item_id, parseInt(row.sold ?? '0', 10));
    }
    return map;
  }

  private async attachRemainingToItems(
    items: FoodItem[],
    kitchenId: string,
    scheduledFor: string,
  ): Promise<Array<FoodItem & { remaining_daily_orders: number }>> {
    const ids = items.map((i) => i.id);
    const soldMap = await this.getSoldQuantitiesForKitchenDate(
      kitchenId,
      ids,
      scheduledFor,
    );
    const blockedRows = await this.foodItemAvailabilityRepo.find({
      where: {
        food_item_id: In(ids),
        date: scheduledFor,
        is_available: false,
      },
      select: ['food_item_id'],
    });
    const blocked = new Set(blockedRows.map((r) => r.food_item_id));

    return items.map((item) => {
      const sold = soldMap.get(item.id) ?? 0;
      let remaining = Math.max(0, item.max_daily_orders - sold);
      if (blocked.has(item.id)) {
        remaining = 0;
      }
      return { ...item, remaining_daily_orders: remaining };
    });
  }
}
