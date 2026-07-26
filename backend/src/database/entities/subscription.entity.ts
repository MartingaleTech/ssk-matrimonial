import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { searchableEncryptedString } from '../../common/crypto/encryption';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ type: 'varchar', length: 20, default: 'trialing' })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  provider: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: searchableEncryptedString,
  })
  provider_subscription_id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: searchableEncryptedString,
  })
  provider_customer_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  current_period_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  current_period_end: Date;

  @Column({ type: 'boolean', default: false })
  is_free_trial: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;
}
