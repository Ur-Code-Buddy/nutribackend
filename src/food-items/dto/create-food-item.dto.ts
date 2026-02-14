import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateFoodItemDto {
  @IsOptional()
  kitchen_id: string; // Set by controller

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  image_url: string;

  @IsNumber()
  @IsOptional()
  max_daily_orders: number;
}
