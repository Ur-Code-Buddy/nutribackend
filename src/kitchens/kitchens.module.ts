import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchensService } from './kitchens.service';
import { KitchensController } from './kitchens.controller';
import { Kitchen } from './entities/kitchen.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kitchen]), CommonModule],
  controllers: [KitchensController],
  providers: [KitchensService],
  exports: [KitchensService],
})
export class KitchensModule {}
