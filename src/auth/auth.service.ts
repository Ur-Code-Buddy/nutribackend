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

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        return this.usersService.create(
            registerDto.username,
            passwordHash,
            registerDto.role,
        );
    }
}
