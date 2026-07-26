import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsUUID()
  profile_id: string;

  @IsUUID()
  favorited_profile_id: string;
}
