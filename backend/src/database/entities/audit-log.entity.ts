import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileManager } from './profile-manager.entity';
import { Profile } from './profile.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actor_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  actor_manager_id: string;

  @Column({ type: 'uuid', nullable: true })
  profile_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_user_id' })
  actor_user: User;

  @ManyToOne(() => ProfileManager, { nullable: true })
  @JoinColumn({ name: 'actor_manager_id' })
  actor_manager: ProfileManager;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
