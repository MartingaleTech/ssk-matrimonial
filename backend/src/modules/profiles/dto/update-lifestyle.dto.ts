import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateLifestyleDto {
  @IsString()
  @IsOptional()
  diet?: string;

  @IsString()
  @IsOptional()
  smoking?: string;

  @IsString()
  @IsOptional()
  drinking?: string;

  @IsArray()
  @IsOptional()
  hobbies?: string[];
}
