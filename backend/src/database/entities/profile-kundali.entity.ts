import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_kundali')
export class ProfileKundali {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'date', nullable: true })
  birth_date: string;

  @Column({ type: 'time', nullable: true })
  birth_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birth_place: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rashi: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nakshatra: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lagna: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  manglik_status: string;

  @Column({ type: 'jsonb', nullable: true })
  planetary_positions: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  houses: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  doshas: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  kundali_generated: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kundali_source: string;

  @Column({ type: 'timestamptz', nullable: true })
  generated_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Profile, (profile) => profile.kundali, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
