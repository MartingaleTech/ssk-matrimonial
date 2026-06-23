import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_basic_details')
export class ProfileBasicDetails {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  community: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mother_tongue: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  religion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  caste_subgroup: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gotra: string;

  @OneToOne(() => Profile, (profile) => profile.basic_details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
