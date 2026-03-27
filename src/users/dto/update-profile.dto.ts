import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

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

  /** Full URL (e.g. S3) to the user’s profile image. Send `null` to remove. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'profile_picture_url must be a valid http(s) URL' },
  )
  @MaxLength(2048)
  profile_picture_url?: string | null;
}
