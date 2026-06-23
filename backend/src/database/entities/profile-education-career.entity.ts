import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_education_career')
export class ProfileEducationCareer {
  @PrimaryColumn({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  highest_education: string;

  @Column({ type: 'text', nullable: true })
  education_details: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  annual_income_range: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  work_location_city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  work_location_country: string;

  @OneToOne(() => Profile, (profile) => profile.education_career, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
