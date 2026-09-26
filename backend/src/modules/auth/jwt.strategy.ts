import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserSession } from '../../database/entities';
import { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: Partial<JwtPayload>) {
    if (!payload.sub || !payload.sid) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionRepo.findOne({
      where: { id: payload.sid, user_id: payload.sub },
    });
    if (!session || session.expires_at.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.is_active) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      session_id: session.id,
    };
  }
}
