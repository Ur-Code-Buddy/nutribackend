import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.registerQueue({
      name: 'orders',
    }),
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule { }
