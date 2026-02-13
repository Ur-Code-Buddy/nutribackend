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
  ) { }

  create(createFoodItemDto: CreateFoodItemDto) {
    const item = this.foodItemRepo.create(createFoodItemDto);
    return this.foodItemRepo.save(item);
  }

  findAllByKitchen(kitchenId: string) {
    return this.foodItemRepo.find({ where: { kitchen_id: kitchenId } });
  }

  async findOne(id: string) {
    const item = await this.foodItemRepo.findOne({
      where: { id },
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
