import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`,
    );
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email sent for job ${job.id}`);
    return {};
  }
}
