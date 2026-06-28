import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileManager } from './profile-manager.entity';

@Entity('connections')
@Unique(['from_profile_id', 'to_profile_id'])
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  from_profile_id: string;

  @Column({ type: 'uuid' })
  to_profile_id: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  initiated_by_manager_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  requested_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  responded_at: Date | null;

  @Column({ type: 'text', nullable: true })
  message: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_profile_id' })
  from_profile: Profile;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_profile_id' })
  to_profile: Profile;

  @ManyToOne(() => ProfileManager, { nullable: true })
  @JoinColumn({ name: 'initiated_by_manager_id' })
  initiated_by_manager: ProfileManager;
}
