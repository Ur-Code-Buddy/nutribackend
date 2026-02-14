import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Processor('orders')
export class JobsService extends WorkerHost {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>, // Create a simple way to access repo or inject OrdersService (but avoid circular)
    // Actually injecting TypeOrm repo directly is fine if Order entity is registered in JobsModule imports (via TypeOrm.forFeature)
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<any> {
    if (job.name === 'order-timeout') {
      const { orderId } = job.data;
      this.logger.log(`Processing timeout for order ${orderId}`);

      const order = await this.ordersRepo.findOne({ where: { id: orderId } });
      if (!order) {
        this.logger.warn(`Order ${orderId} not found in job processor.`);
        return;
      }

      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.REJECTED;
        await this.ordersRepo.save(order);
        this.logger.log(`Order ${orderId} auto-rejected due to timeout.`);
      } else {
        this.logger.log(
          `Order ${orderId} already handled (Status: ${order.status}).`,
        );
      }
    }
  }
}
