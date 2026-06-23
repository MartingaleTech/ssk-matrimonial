import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChatThread,
  ChatMessage,
  ProfileManager,
  Block,
  Connection,
} from '../../database/entities';
import { CreateThreadDto, SendMessageDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatThread)
    private threadRepo: Repository<ChatThread>,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
    @InjectRepository(ProfileManager)
    private managerRepo: Repository<ProfileManager>,
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
    @InjectRepository(Connection)
    private connectionRepo: Repository<Connection>,
  ) {}

  async getThreads(userId: string, profileId: string) {
    await this.assertChatAccess(userId, profileId);

    return this.threadRepo
      .createQueryBuilder('t')
      .where('(t.profile1_id = :pid OR t.profile2_id = :pid)', {
        pid: profileId,
      })
      .orderBy('t.last_message_at', 'DESC')
      .getMany();
  }

  async createThread(dto: CreateThreadDto, userId: string) {
    const [p1, p2] = [dto.profile1_id, dto.profile2_id].sort();

    await this.assertChatAccess(userId, dto.profile1_id);

    // Check blocks
    const block = await this.blockRepo.findOne({
      where: [
        { blocked_by_profile_id: p1, blocked_profile_id: p2 },
        { blocked_by_profile_id: p2, blocked_profile_id: p1 },
      ],
    });
    if (block) {
      throw new ForbiddenException('Cannot chat with blocked profile');
    }

    // Check accepted connection
    const connection = await this.connectionRepo.findOne({
      where: [
        { from_profile_id: p1, to_profile_id: p2, status: 'accepted' },
        { from_profile_id: p2, to_profile_id: p1, status: 'accepted' },
      ],
    });
    if (!connection) {
      throw new ForbiddenException(
        'Connection must be accepted before chatting',
      );
    }

    // Check existing thread
    const existing = await this.threadRepo.findOne({
      where: { profile1_id: p1, profile2_id: p2 },
    });
    if (existing) return existing;

    const thread = this.threadRepo.create({
      profile1_id: p1,
      profile2_id: p2,
    });
    return this.threadRepo.save(thread);
  }

  async getMessages(
    threadId: string,
    userId: string,
    query: Record<string, string>,
  ) {
    const thread = await this.getThreadOrFail(threadId);
    await this.assertChatAccessForThread(userId, thread);

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '50');

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { thread_id: threadId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages, total, page, limit };
  }

  async sendMessage(
    threadId: string,
    dto: SendMessageDto,
    userId: string,
    profileId: string,
  ) {
    const thread = await this.getThreadOrFail(threadId);
    const manager = await this.assertChatAccess(userId, profileId);

    if (thread.profile1_id !== profileId && thread.profile2_id !== profileId) {
      throw new ForbiddenException('Profile is not part of this thread');
    }

    const message = this.messageRepo.create({
      thread_id: threadId,
      sender_profile_id: profileId,
      sender_manager_id: manager.id,
      message_type: dto.message_type || 'text',
      content: dto.content,
    });
    await this.messageRepo.save(message);

    thread.last_message_at = new Date();
    await this.threadRepo.save(thread);

    return message;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['thread'],
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const thread = message.thread;
    const otherProfileId =
      message.sender_profile_id === thread.profile1_id
        ? thread.profile2_id
        : thread.profile1_id;

    await this.assertChatAccess(userId, otherProfileId);

    message.read_at = new Date();
    return this.messageRepo.save(message);
  }

  private async getThreadOrFail(id: string): Promise<ChatThread> {
    const thread = await this.threadRepo.findOne({ where: { id } });
    if (!thread) {
      throw new NotFoundException('Chat thread not found');
    }
    return thread;
  }

  private async assertChatAccess(
    userId: string,
    profileId: string,
  ): Promise<ProfileManager> {
    const managers = await this.managerRepo.find({
      where: { user_id: userId, profile_id: profileId },
    });
    const manager = managers.find(
      (m) => m.role === 'owner' || m.role === 'parent',
    );
    if (!manager) {
      throw new ForbiddenException('Only owner or parent can access chat');
    }
    return manager;
  }

  async verifyThreadAccess(threadId: string, userId: string): Promise<void> {
    const thread = await this.getThreadOrFail(threadId);
    await this.assertChatAccessForThread(userId, thread);
  }

  private async assertChatAccessForThread(
    userId: string,
    thread: ChatThread,
  ): Promise<void> {
    const managers = await this.managerRepo.find({
      where: [
        { user_id: userId, profile_id: thread.profile1_id },
        { user_id: userId, profile_id: thread.profile2_id },
      ],
    });
    const hasAccess = managers.some(
      (m) => m.role === 'owner' || m.role === 'parent',
    );
    if (!hasAccess) {
      throw new ForbiddenException('Only owner or parent can access chat');
    }
  }
}
