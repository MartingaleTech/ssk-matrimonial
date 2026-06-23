import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_partner_preferences')
export class ProfilePartnerPreferences {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'int', nullable: true })
  age_min: number;

  @Column({ type: 'int', nullable: true })
  age_max: number;

  @Column({ type: 'int', nullable: true })
  height_min_cm: number;

  @Column({ type: 'int', nullable: true })
  height_max_cm: number;

  @Column({ type: 'jsonb', nullable: true })
  marital_status_allowed: string[];

  @Column({ type: 'jsonb', nullable: true })
  education_levels: string[];

  @Column({ type: 'jsonb', nullable: true })
  occupations: string[];

  @Column({ type: 'jsonb', nullable: true })
  locations: string[];

  @Column({ type: 'jsonb', nullable: true })
  diet_preferences: string[];

  @Column({ type: 'varchar', length: 20, nullable: true })
  smoking_preference: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  drinking_preference: string;

  @Column({ type: 'jsonb', nullable: true })
  kundali_requirements: Record<string, unknown>;

  @OneToOne(() => Profile, (profile) => profile.partner_preferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
