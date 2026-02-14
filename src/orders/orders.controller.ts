import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto'; // Not really used for general updates, maybe just status
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.role.enum';
import { OrderStatus } from './entities/order.entity';
import { KitchensService } from '../kitchens/kitchens.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly kitchenService: KitchensService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    // Should add visibility check (is owner or client of this order)
    return this.ordersService.findOne(id);
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async accept(@Request() req: any, @Param('id') id: string) {
    await this.validateOrderOwnership(req.user.userId, id);
    return this.ordersService.updateStatus(id, OrderStatus.ACCEPTED);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KITCHEN_OWNER)
  async reject(@Request() req: any, @Param('id') id: string) {
    await this.validateOrderOwnership(req.user.userId, id);
    return this.ordersService.updateStatus(id, OrderStatus.REJECTED);
  }

  private async validateOrderOwnership(userId: string, orderId: string) {
    const order = await this.ordersService.findOne(orderId);
    if (!order) throw new BadRequestException('Order not found');

    // Check if the kitchen belongs to this user
    // We can assume we have logic or just check kitchen owner_id from kitchen service
    // Or simpler: join kitchen in order query and check owner_id
    // But currently order.kitchen relation is just kitchen entity, might not load owner_id unless eager or selected.
    // Let's rely on standard service fetch.
    const kitchen = await this.kitchenService.findOne(order.kitchen_id);
    if (kitchen.owner_id !== userId) {
      throw new BadRequestException('Not your order to manage');
    }
  }
}
