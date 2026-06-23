import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_privacy_settings')
export class ProfilePrivacySettings {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'boolean', default: true })
  show_full_name: boolean;

  @Column({ type: 'boolean', default: true })
  show_work_details: boolean;

  @Column({ type: 'boolean', default: true })
  show_location_city: boolean;

  @Column({ type: 'boolean', default: false })
  show_kundali_public: boolean;

  @Column({ type: 'boolean', default: false })
  allow_non_connected_chat_requests: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Profile, (profile) => profile.privacy_settings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
