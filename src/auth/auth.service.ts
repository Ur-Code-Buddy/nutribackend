import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }

    async register(registerDto: RegisterDto): Promise<User> {
        const existingUser = await this.usersService.findOneByUsername(registerDto.username);
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // We could add explicit checks for email/phone here if we want specific error messages
        // or let the DB unique constraint throw (which might need a filter to be user-friendly).
        // For better UX, let's try to find by email/phone if we add those methods to UsersService,
        // or just proceed and handle the error.
        // Given constraints, let's update UsersService to find by email/phone for cleaner validation.

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        try {
            return await this.usersService.create(
                registerDto.username,
                passwordHash,
                registerDto.role,
                registerDto.name,
                registerDto.email,
                registerDto.phone_number,
                registerDto.address,
            );
        } catch (error) {
            if (error.code === '23505') { // Postgres unique_violation
                if (error.detail.includes('email')) {
                    throw new ConflictException('Email already exists');
                } else if (error.detail.includes('phone_number')) {
                    throw new ConflictException('Phone number already exists');
                }
            }
            throw error;
        }
    }
}
