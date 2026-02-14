import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.role.enum';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DELIVERY_DRIVER)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get('available')
  findAllAvailable() {
    return this.deliveriesService.findAllAvailable();
  }

  @Get('my-orders')
  findMyOrders(@Request() req: any) {
    return this.deliveriesService.findMyOrders(req.user.id);
  }

  @Patch(':id/accept')
  acceptDelivery(@Param('id') id: string, @Request() req: any) {
    return this.deliveriesService.acceptDelivery(id, req.user.id);
  }

  @Patch(':id/finish')
  finishDelivery(@Param('id') id: string, @Request() req: any) {
    return this.deliveriesService.finishDelivery(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }
}
