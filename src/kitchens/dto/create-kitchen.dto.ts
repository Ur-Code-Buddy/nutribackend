import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateKitchenDto {
    @IsOptional()
    owner_id: string; // Set by controller from JWT

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsObject()
    @IsOptional()
    details: any;

    @IsObject()
    @IsOptional()
    operating_hours: any;

    @IsString()
    @IsOptional()
    image_url: string;

    @IsOptional()
    is_active: boolean;

    @IsOptional()
    is_menu_visible: boolean;
}
