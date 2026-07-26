import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity('plan_prices')
@Unique(['plan_id', 'country'])
export class PlanPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ type: 'varchar', length: 2 })
  country: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  /** Amount in minor units (paise for INR, cents for USD). */
  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: 'month' })
  interval: string;

  /** Provider price/plan identifier (Stripe price id, Razorpay plan id). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_price_id: string;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;
}
