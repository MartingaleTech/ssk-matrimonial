import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsIn(['text', 'image', 'file'])
  @IsOptional()
  message_type?: string;

  @IsUUID()
  profile_id: string;
}
