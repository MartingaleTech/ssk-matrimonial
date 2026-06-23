import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_lifestyle')
export class ProfileLifestyle {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  diet: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  smoking: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  drinking: string;

  @Column({ type: 'jsonb', nullable: true })
  hobbies: string[];

  @OneToOne(() => Profile, (profile) => profile.lifestyle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
