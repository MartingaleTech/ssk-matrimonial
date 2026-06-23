import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Profile } from './profile.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_threads')
@Unique(['profile1_id', 'profile2_id'])
export class ChatThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile1_id: string;

  @Column({ type: 'uuid' })
  profile2_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile1_id' })
  profile1: Profile;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile2_id' })
  profile2: Profile;

  @OneToMany(() => ChatMessage, (msg) => msg.thread)
  messages: ChatMessage[];
}
