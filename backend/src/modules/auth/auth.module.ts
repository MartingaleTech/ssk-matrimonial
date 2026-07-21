import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwilioService } from './twilio.service';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSession, OtpCode } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, OtpCode]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret',
        signOptions: { expiresIn: 604800 },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TwilioService, JwtStrategy],
  exports: [AuthService, TwilioService, JwtModule],
})
export class AuthModule {}
