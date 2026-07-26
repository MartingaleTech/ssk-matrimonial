import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { searchableEncryptedString } from '../../common/crypto/encryption';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  subscription_id: string | null;

  @Column({ type: 'varchar', length: 20 })
  provider: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: searchableEncryptedString,
  })
  provider_payment_id: string;

  /** Amount in minor units (paise for INR, cents for USD). */
  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  method: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
