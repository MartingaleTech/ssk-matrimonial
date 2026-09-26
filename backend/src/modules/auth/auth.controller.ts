import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Public } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators';

@Controller('auth')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private meta(req: Request) {
    return { deviceInfo: req.headers['user-agent'], ipAddress: req.ip };
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, this.meta(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.meta(req));
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.authService.verifyOtp(dto, this.meta(req));
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto, this.meta(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentUser('id') userId: string,
    @CurrentUser('session_id') sessionId: string,
    @Body('all') all?: boolean,
  ) {
    return this.authService.logout(userId, sessionId, all === true);
  }
}
