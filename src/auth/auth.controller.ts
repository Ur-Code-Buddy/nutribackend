import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendPhoneOtpDto } from './dto/resend-phone-otp.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message:
        'Registration successful. Please check your email and verify your phone number via the /auth/verify-phone endpoint.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }
    return this.authService.login(user);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: any) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://www.nutritiffin.com';
    try {
      await this.authService.verifyEmail(token);
      return res.redirect(`${frontendUrl}/verification-success`);
    } catch (error) {
      let reason = 'invalid';
      if (error.message && error.message.toLowerCase().includes('expired')) {
        reason = 'expired';
      }
      return res.redirect(
        `${frontendUrl}/verification-failed?reason=${reason}`,
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Throttle({ default: { limit: 1, ttl: 30000 } })
  @HttpCode(HttpStatus.OK)
  @Post('retry-email-login')
  async retryEmailLogin(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }
  @Throttle({ default: { limit: 1, ttl: 10000 } })
  @HttpCode(HttpStatus.OK)
  @Post('check-email-verified')
  async checkEmailVerified(@Body() dto: ResendVerificationDto) {
    return this.authService.checkEmailVerified(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('delete-account')
  async deleteAccount(@Req() req: any) {
    return this.authService.deleteAccount(req.user.userId);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Throttle({ default: { limit: 1, ttl: 30000 } })
  @HttpCode(HttpStatus.OK)
  @Post('resend-phone-otp')
  async resendPhoneOtp(@Body() dto: ResendPhoneOtpDto) {
    return this.authService.resendPhoneOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-phone')
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    return this.authService.verifyPhone(dto);
  }
}
