import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_family_info')
export class ProfileFamilyInfo {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  family_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  father_occupation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mother_occupation: string;

  @Column({ type: 'int', nullable: true })
  siblings_brothers: number;

  @Column({ type: 'int', nullable: true })
  siblings_sisters: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  family_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  family_values: string;

  @OneToOne(() => Profile, (profile) => profile.family_info, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
