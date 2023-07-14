import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';

import { MovieModel } from './movie.model';
import { UpdateMovieDto } from './update-movie.dto';

@Injectable()
export class MovieService {
  constructor(@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>) {}

  async getAll(searchTerm?: string) {
    let options = {};

    if (searchTerm) {
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    }

    return this.MovieModel.find(options)
      .select('-updatedAt -__v')
      .sort({ createdAt: 'desc' })
      .populate('actors genres');
  }

  async bySlug(slug: string) {
    const movie = await this.MovieModel.findOne({ slug }).populate('actors genres');

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async byActorId(actorId: Types.ObjectId) {
    const movies = await this.MovieModel.find({ actors: actorId });

    if (movies.length < 1) {
      throw new NotFoundException('Movies not found');
    }

    return movies;
  }

  byGenres(genresId: Types.ObjectId[]) {
    return this.MovieModel.find({ genres: { $in: genresId } });
  }

  async updateCountOpened(slug: string) {
    const movie = await this.MovieModel.findOneAndUpdate(
      { slug },
      {
        $inc: { countOpened: 1 },
      },
      { new: true }
    );

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async getMostPopular() {
    return this.MovieModel.find({ countOpened: { $gt: 0 } })
      .sort({ countOpened: -1 })
      .populate('genres');
  }

  // FOR ADMINS
  async byId(_id: string) {
    const movie = await this.MovieModel.findById(_id);

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async create() {
    const defaultValue: UpdateMovieDto = {
      poster: '',
      bigPoster: '',
      title: '',
      slug: '',
      videoUrl: '',
      genres: [],
      actors: [],
    };

    const movie = await this.MovieModel.create(defaultValue);

    return movie._id;
  }

  async update(_id: string, dto: UpdateMovieDto) {
    // TODO notify with telegram
    const movie = await this.MovieModel.findByIdAndUpdate(_id, dto, { new: true });

    if (!movie) {
      throw new BadRequestException('Movie not found');
    }

    return movie;
  }

  async delete(_id: string) {
    const movie = await this.MovieModel.findByIdAndDelete(_id);

    if (!movie) {
      throw new BadRequestException('Movie not found');
    }

    return movie;
  }
}
