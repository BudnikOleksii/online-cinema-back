import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';

import { RatingModel } from './rating.model';
import { MovieService } from '../movie/movie.service';
import { SetRatingDto } from './set-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(RatingModel) private readonly RatingModel: ModelType<RatingModel>,
    private readonly MovieService: MovieService
  ) {}

  async getMovieValueByUser(movieId: Types.ObjectId, userId: Types.ObjectId) {
    return this.RatingModel.findOne({ movieId, userId })
      .select('value')
      .then((data) => (data ? data.value : 0));
  }

  async averageMovieRating(movieId: Types.ObjectId | string) {
    const ratings: RatingModel[] = await this.RatingModel.aggregate().match({
      movieId: new Types.ObjectId(movieId),
    });

    return ratings.reduce((acc, rating) => acc + rating.value, 0) / ratings.length;
  }

  async setRating(userId: Types.ObjectId, dto: SetRatingDto) {
    const { movieId, value } = dto;

    const newRating = await this.RatingModel.findOneAndUpdate(
      { movieId, userId },
      { movieId, userId, value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const averageRating = await this.averageMovieRating(movieId);
    await this.MovieService.updateRating(movieId, averageRating);

    return newRating;
  }
}
