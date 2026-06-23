import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_search_index')
export class ProfileSearchIndex {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', nullable: true })
  height_cm: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  education_level: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  community: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  manglik_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rashi: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nakshatra: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  guna_total_score: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Profile, (profile) => profile.search_index, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
