import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsIn(['email', 'sms'])
  channel: string;
}
