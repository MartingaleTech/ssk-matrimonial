import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProfileManager } from './profile-manager.entity';
import { ProfileBasicDetails } from './profile-basic-details.entity';
import { ProfileEducationCareer } from './profile-education-career.entity';
import { ProfileFamilyInfo } from './profile-family-info.entity';
import { ProfileLifestyle } from './profile-lifestyle.entity';
import { ProfileLocation } from './profile-location.entity';
import { ProfilePhoto } from './profile-photo.entity';
import { ProfilePrivacySettings } from './profile-privacy-settings.entity';
import { ProfilePartnerPreferences } from './profile-partner-preferences.entity';
import { ProfileKundali } from './profile-kundali.entity';
import { KundaliPreferences } from './kundali-preferences.entity';
import { ProfileSearchIndex } from './profile-search-index.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  display_name: string;

  @Column({ type: 'varchar', length: 20 })
  gender: string;

  @Column({ type: 'date' })
  date_of_birth: string;

  @Column({ type: 'int', nullable: true })
  height_cm: number;

  @Column({ type: 'varchar', length: 50 })
  marital_status: string;

  @Column({ type: 'text', nullable: true })
  about_me: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  profile_status: string;

  @Column({ type: 'boolean', default: false })
  has_kundali: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ProfileManager, (pm) => pm.profile)
  managers: ProfileManager[];

  @OneToOne(() => ProfileBasicDetails, (bd) => bd.profile)
  basic_details: ProfileBasicDetails;

  @OneToOne(() => ProfileEducationCareer, (ec) => ec.profile)
  education_career: ProfileEducationCareer;

  @OneToOne(() => ProfileFamilyInfo, (fi) => fi.profile)
  family_info: ProfileFamilyInfo;

  @OneToOne(() => ProfileLifestyle, (ls) => ls.profile)
  lifestyle: ProfileLifestyle;

  @OneToOne(() => ProfileLocation, (loc) => loc.profile)
  location: ProfileLocation;

  @OneToMany(() => ProfilePhoto, (ph) => ph.profile)
  photos: ProfilePhoto[];

  @OneToOne(() => ProfilePrivacySettings, (ps) => ps.profile)
  privacy_settings: ProfilePrivacySettings;

  @OneToOne(() => ProfilePartnerPreferences, (pp) => pp.profile)
  partner_preferences: ProfilePartnerPreferences;

  @OneToOne(() => ProfileKundali, (k) => k.profile)
  kundali: ProfileKundali;

  @OneToOne(() => KundaliPreferences, (kp) => kp.profile)
  kundali_preferences: KundaliPreferences;

  @OneToOne(() => ProfileSearchIndex, (si) => si.profile)
  search_index: ProfileSearchIndex;
}
