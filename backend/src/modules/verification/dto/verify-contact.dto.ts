import { IsUUID, IsString, Length, IsIn } from 'class-validator';

export class RequestContactOtpDto {
  @IsUUID()
  profile_id: string;

  @IsIn(['email', 'phone'])
  channel: 'email' | 'phone';
}

export class VerifyContactDto {
  @IsUUID()
  profile_id: string;

  @IsString()
  @Length(4, 10)
  code: string;
}
