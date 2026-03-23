import { IsString, IsNotEmpty } from 'class-validator';

export class ResendPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
