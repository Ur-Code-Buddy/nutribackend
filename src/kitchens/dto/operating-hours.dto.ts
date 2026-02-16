import {
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DailyHoursDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in HH:MM format (e.g. 09:30)',
    })
    open: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in HH:MM format (e.g. 18:00)',
    })
    close: string;
}

export class OperatingHoursDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    monday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    tuesday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    wednesday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    thursday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    friday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    saturday?: DailyHoursDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyHoursDto)
    sunday?: DailyHoursDto;
}
