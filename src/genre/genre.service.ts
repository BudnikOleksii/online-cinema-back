import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { genSalt, hash } from 'bcryptjs';
import { GenreModel } from './genre.model';
import { CreateGenreDto } from './dto/create.genre.dto';
import { MovieService } from '../movie/movie.service';
import { ICollection } from './genre.interface';

@Injectable()
export class GenreService {
  constructor(@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
              private readonly MovieService: MovieService) {}

  async bySlug(slug: string) {
    const genre = await this.GenreModel.findOne({ slug });

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return genre;
  }

  getAll(searchTerm?: string) {
    let options = {};

    if (searchTerm) {
      options = {
        $or: [
          {
            name: new RegExp(searchTerm, 'i'),
          },
          {
            slug: new RegExp(searchTerm, 'i'),
          },
          {
            description: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    }

    return this.GenreModel.find(options).select('-updatedAt -__v').sort({ createdAt: 'desc' });
  }

  async getCollections() {
    const genres = await this.getAll();
    const collections = await Promise.all(genres.map( async (genre)=> {
      const moviesByGenre = await this.MovieService.byGenres([genre._id]);

      const result: ICollection = {
        _id: String(genre._id),
        slug: genre.slug,
        title: genre.name,
        image: moviesByGenre.length > 0 ? moviesByGenre[0].bigPoster : null, // TODO if no movies return placeholder
      };

      return result;
    }));

    return collections;
  }

  // For admins
  async byId(_id: string) {
    const genre = await this.GenreModel.findById(_id);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return genre;
  }

  async create() {
    const defaultValue: CreateGenreDto = {
      name: '',
      slug: '',
      description: '',
      icon: '',
    };

    const genre = await this.GenreModel.create(defaultValue);

    return genre._id;
  }

  async update(_id: string, dto: CreateGenreDto) {
    const genre = await this.GenreModel.findByIdAndUpdate(_id, dto, { new: true });

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return genre;
  }

  async delete(id: string) {
    const genre = await this.GenreModel.findByIdAndDelete(id);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return genre;
  }
}
