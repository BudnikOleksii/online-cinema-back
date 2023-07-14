import { Types } from 'mongoose';
import { IsNumber, IsString } from 'class-validator';

export class SetRatingDto {
  @IsString()
  movieId: Types.ObjectId;

  @IsNumber()
  value: number;
}
