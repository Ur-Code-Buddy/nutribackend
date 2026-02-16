import { OperatingHoursDto } from './operating-hours.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

export class CreateKitchenDto {
  @IsOptional()
  owner_id: string; // Set by controller from JWT

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsOptional()
  details: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours: OperatingHoursDto;

  @IsString()
  @IsOptional()
  image_url: string;

  @IsOptional()
  is_active: boolean;

  @IsOptional()
  is_menu_visible: boolean;
}
