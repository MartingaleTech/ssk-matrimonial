import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';

@Entity('profile_managers')
@Unique(['user_id', 'profile_id'])
export class ProfileManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 20 })
  role: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'uuid', nullable: true })
  added_by_manager_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.profile_managers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Profile, (profile) => profile.managers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => ProfileManager, { nullable: true })
  @JoinColumn({ name: 'added_by_manager_id' })
  added_by_manager: ProfileManager;
}
