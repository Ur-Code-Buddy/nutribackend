import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty()
    current_password: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phone_number?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    pincode?: string;
}
