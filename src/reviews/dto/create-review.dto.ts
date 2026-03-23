import { IsNotEmpty, IsString, IsBoolean, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  order_item_id: string;

  @IsBoolean()
  @IsNotEmpty()
  is_positive: boolean;
}
