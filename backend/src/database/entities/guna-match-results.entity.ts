import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('guna_match_results')
@Unique(['profile1_id', 'profile2_id'])
export class GunaMatchResults {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile1_id: string;

  @Column({ type: 'uuid' })
  profile2_id: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  guna_total_score: number;

  @Column({ type: 'jsonb', nullable: true })
  guna_breakdown: Record<string, unknown>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  match_quality: string;

  @Column({ type: 'text', nullable: true })
  ai_summary: string;

  @Column({ type: 'timestamptz', nullable: true })
  generated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile1_id' })
  profile1: Profile;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile2_id' })
  profile2: Profile;
}
