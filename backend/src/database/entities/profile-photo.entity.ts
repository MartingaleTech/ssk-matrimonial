import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_photos')
export class ProfilePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Profile, (profile) => profile.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
