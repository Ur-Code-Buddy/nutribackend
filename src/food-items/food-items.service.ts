import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem } from './entities/food-item.entity';

import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private foodItemRepo: Repository<FoodItem>,
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
  findAvailableByKitchen(kitchenId: string) {
    return this.foodItemRepo.find({
      where: { kitchen_id: kitchenId, is_available: true },
    });
  }

  async findOne(id: string) {
    const item = await this.foodItemRepo.findOne({
      where: { id },
    });
    if (!item) throw new NotFoundException('Food item not found');
    return item;
  }

  async findOnePublic(id: string) {
    const item = await this.foodItemRepo.findOne({
      where: { id, is_available: true },
    });
    if (!item) throw new NotFoundException('Food item not found');
    return item;
  }

  async update(id: string, updateFoodItemDto: UpdateFoodItemDto) {
    await this.foodItemRepo.update(id, updateFoodItemDto);
    return this.findOne(id);
  }

  async setAvailability(foodItemId: string, isAvailable: boolean) {
    await this.foodItemRepo.update(foodItemId, { is_available: isAvailable });
    return this.findOne(foodItemId);
  }
}
