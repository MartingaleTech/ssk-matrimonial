import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class GenerateKundaliDto {
  @IsUUID()
  profile_id: string;

  @IsString()
  birth_date: string;

  @IsString()
  birth_time: string;

  @IsString()
  birth_place: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  timezone?: string;
}
