import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerParams } from './common/logging/logger.config';
import type { DatabaseConnection } from './config/database.config';
import {
  databaseConfig,
  jwtConfig,
  paymentsConfig,
  storageConfig,
  twilioConfig,
} from './config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HttpThrottlerGuard } from './guards/http-throttler.guard';

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
import { AdminModule } from './modules/admin/admin.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StorageModule } from './modules/storage/storage.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        twilioConfig,
        paymentsConfig,
        storageConfig,
      ],
    }),
    LoggerModule.forRoot(buildLoggerParams()),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        ...configService.get<DatabaseConnection>('database'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: process.env.DB_RUN_MIGRATIONS !== 'false',
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
    AdminModule,
    FavoritesModule,
    SubscriptionsModule,
    PaymentsModule,
    StorageModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
