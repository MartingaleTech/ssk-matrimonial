import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('kundali_preferences')
export class KundaliPreferences {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'boolean', default: false })
  require_kundali_match: boolean;

  @Column({ type: 'int', nullable: true })
  minimum_guna_score: number;

  @Column({ type: 'jsonb', nullable: true })
  preferred_doshas: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferred_rashi: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferred_nakshatra: string[];

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Profile, (profile) => profile.kundali_preferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
