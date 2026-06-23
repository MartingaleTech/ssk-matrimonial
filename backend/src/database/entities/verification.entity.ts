import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  requested_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  verified_at: Date;

  @Column({ type: 'uuid', nullable: true })
  verified_by_admin_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
