import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserSession, OtpCode } from '../../database/entities';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
    @InjectRepository(OtpCode)
    private otpRepo: Repository<OtpCode>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    if (dto.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    if (dto.phone) {
      const existing = await this.userRepo.findOne({
        where: { phone: dto.phone },
      });
      if (existing) {
        throw new ConflictException('Phone already registered');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      password_hash: passwordHash,
    });
    await this.userRepo.save(user);

    const token = this.generateToken(user);
    return {
      user: { id: user.id, email: user.email, phone: user.phone },
      token,
    };
  }

  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const where = dto.email ? { email: dto.email } : { phone: dto.phone };
    const user = await this.userRepo.findOne({ where });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    user.last_login_at = new Date();
    await this.userRepo.save(user);

    const session = this.sessionRepo.create({
      user_id: user.id,
      device_info: deviceInfo,
      ip_address: ipAddress,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepo.save(session);

    const token = this.generateToken(user);
    return {
      user: { id: user.id, email: user.email, phone: user.phone },
      token,
      session_id: session.id,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const where = dto.email ? { email: dto.email } : { phone: dto.phone };
    const user = await this.userRepo.findOne({ where });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = this.otpRepo.create({
      user_id: user.id,
      channel: dto.channel,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });
    await this.otpRepo.save(otp);

    // In production, send via email/SMS provider
    return { message: 'OTP sent successfully', otp_id: otp.id };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const where = dto.email ? { email: dto.email } : { phone: dto.phone };
    const user = await this.userRepo.findOne({ where });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = await this.otpRepo
      .createQueryBuilder('otp')
      .where('otp.user_id = :userId', { userId: user.id })
      .andWhere('otp.code = :code', { code: dto.code })
      .andWhere('otp.expires_at > :now', { now: new Date() })
      .andWhere('otp.used_at IS NULL')
      .orderBy('otp.created_at', 'DESC')
      .getOne();

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otp.used_at = new Date();
    await this.otpRepo.save(otp);

    const token = this.generateToken(user);
    return { verified: true, token };
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.sessionRepo.delete({ id: sessionId, user_id: userId });
    } else {
      await this.sessionRepo.delete({ user_id: userId });
    }
    return { message: 'Logged out successfully' };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      phone: user.phone,
    });
  }
}
