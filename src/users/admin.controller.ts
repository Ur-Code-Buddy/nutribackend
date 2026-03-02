import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.role.enum';
import { UsersService } from './users.service';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly txnService: TransactionsService,
  ) { }

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('credits/add')
  async addCredits(
    @Request() req: any,
    @Body() body: { username: string; credits: number },
  ) {
    const result = await this.txnService.addCredits(
      req.user.userId,
      body.username,
      body.credits,
    );
    return {
      message: `Added ${body.credits} credits to ${body.username}`,
      credits: result.user.credits,
      transaction: {
        id: result.transaction.id,
        short_id: result.transaction.short_id,
      },
    };
  }

  @Post('credits/deduct')
  async deductCredits(
    @Request() req: any,
    @Body() body: { username: string; credits: number },
  ) {
    const result = await this.txnService.deductCredits(
      req.user.userId,
      body.username,
      body.credits,
    );
    return {
      message: `Deducted ${body.credits} credits from ${body.username}`,
      credits: result.user.credits,
      transaction: {
        id: result.transaction.id,
        short_id: result.transaction.short_id,
      },
    };
  }

  @Post('users/:id/disable')
  async disableUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, false);
  }

  @Post('users/:id/enable')
  async enableUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, true);
  }
}
