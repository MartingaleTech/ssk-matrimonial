import { IsString, IsOptional, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsIn(['text', 'image', 'file'])
  @IsOptional()
  message_type?: string;
}
