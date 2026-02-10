import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/user.role.enum';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsEnum(UserRole)
    role: UserRole;
}
