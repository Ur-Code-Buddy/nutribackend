import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodItemsService } from './food-items.service';
import { FoodItemsController } from './food-items.controller';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemAvailability } from './entities/food-item-availability.entity';
import { KitchensModule } from '../kitchens/kitchens.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodItem]),
    KitchensModule,
    CommonModule,
  ],
  controllers: [FoodItemsController],
  providers: [FoodItemsService],
})
export class FoodItemsModule { }
