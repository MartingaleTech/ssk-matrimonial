import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig, jwtConfig } from './config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ProfileManagersModule } from './modules/profile-managers/profile-managers.module';
import { PhotosModule } from './modules/photos/photos.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { SearchModule } from './modules/search/search.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { KundaliModule } from './modules/kundali/kundali.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProfilesModule,
    ProfileManagersModule,
    PhotosModule,
    PreferencesModule,
    SearchModule,
    ConnectionsModule,
    BlocksModule,
    ChatModule,
    NotificationsModule,
    KundaliModule,
    VerificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
