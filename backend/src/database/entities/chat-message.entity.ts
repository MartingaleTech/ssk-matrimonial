import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatThread } from './chat-thread.entity';
import { Profile } from './profile.entity';
import { ProfileManager } from './profile-manager.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  thread_id: string;

  @Column({ type: 'uuid' })
  sender_profile_id: string;

  @Column({ type: 'uuid' })
  sender_manager_id: string;

  @Column({ type: 'varchar', length: 20, default: 'text' })
  message_type: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  read_at: Date;

  @ManyToOne(() => ChatThread, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'thread_id' })
  thread: ChatThread;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_profile_id' })
  sender_profile: Profile;

  @ManyToOne(() => ProfileManager, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_manager_id' })
  sender_manager: ProfileManager;
}
