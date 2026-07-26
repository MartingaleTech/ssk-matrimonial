import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserSession } from './user-session.entity';
import { ProfileManager } from './profile-manager.entity';
import { OtpCode } from './otp-code.entity';
import { Notification } from './notification.entity';
import { UserNotificationSettings } from './user-notification-settings.entity';
import { searchableEncryptedString } from '../../common/crypto/encryption';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  /** Encrypted at rest with a deterministic IV so lookups by phone still work. */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
    transformer: searchableEncryptedString,
  })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => ProfileManager, (pm) => pm.user)
  profile_managers: ProfileManager[];

  @OneToMany(() => OtpCode, (otp) => otp.user)
  otp_codes: OtpCode[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToOne(() => UserNotificationSettings, (ns) => ns.user)
  notification_settings: UserNotificationSettings;
}
