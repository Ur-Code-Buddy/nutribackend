import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { FoodItemsService } from './food-items.service';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.role.enum';
import { KitchensService } from '../kitchens/kitchens.service'; // You might need to export this or just check Kitchen ownership via db

@Controller('menu-items') // Per requirement: POST /menu-items
export class FoodItemsController {
  constructor(
    private readonly foodItemsService: FoodItemsService,
    private readonly kitchensService: KitchensService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async create(@Request() req: any, @Body() createFoodItemDto: CreateFoodItemDto) {
    // Verify user owns the kitchen they are adding items to
    // Assuming createFoodItemDto contains kitchen_id, or we fetch the user's kitchen
    const kitchen = await this.kitchensService.findByOwner(req.user.userId);
    if (!kitchen) {
      throw new BadRequestException('You do not have a kitchen profile yet.');
    }
    createFoodItemDto.kitchen_id = kitchen.id;
    return this.foodItemsService.create(createFoodItemDto);
  }

  @Get('my-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async getMyItems(@Request() req: any) {
    const kitchen = await this.kitchensService.findByOwner(req.user.userId);
    if (!kitchen) {
      throw new NotFoundException('Kitchen not found for this user');
    }
    return this.foodItemsService.findAllByKitchen(kitchen.id);
  }

  @Get('kitchen/:kitchenId')
  findAllByKitchen(@Param('kitchenId') kitchenId: string) {
    return this.foodItemsService.findAllByKitchen(kitchenId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodItemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async update(@Request() req: any, @Param('id') id: string, @Body() updateFoodItemDto: UpdateFoodItemDto) {
    // Validate ownership logic here (omitted slightly for brevity but critical for prod)
    // Check if item belongs to kitchen owned by user
    const item = await this.foodItemsService.findOne(id);
    const kitchen = await this.kitchensService.findOne(item.kitchen_id);
    if (kitchen.owner_id !== req.user.userId) {
      throw new BadRequestException('Not your item');
    }
    return this.foodItemsService.update(id, updateFoodItemDto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async setAvailability(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { is_available: boolean }
  ) {
    if (body.is_available === undefined) {
      throw new BadRequestException('is_available required');
    }
    // Validate ownership
    const item = await this.foodItemsService.findOne(id);
    const kitchen = await this.kitchensService.findOne(item.kitchen_id);
    if (kitchen.owner_id !== req.user.userId) {
      throw new BadRequestException('Not your item');
    }
    return this.foodItemsService.setAvailability(id, body.is_available);
  }
}
