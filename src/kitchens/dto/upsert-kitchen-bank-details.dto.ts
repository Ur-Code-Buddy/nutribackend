import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertKitchenBankDetailsDto {
  @IsString()
  @IsNotEmpty()
  account_holder_name: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsString()
  @IsNotEmpty()
  ifsc_code: string;

  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @IsOptional()
  @IsString()
  upi_id?: string;
}
