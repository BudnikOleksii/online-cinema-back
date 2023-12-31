import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';

import { ActorModel } from './actor.model';
import { ActorDto } from './actor.dto';

@Injectable()
export class ActorService {
  constructor(@InjectModel(ActorModel) private readonly ActorModel: ModelType<ActorModel>) {}

  async bySlug(slug: string) {
    const actor = await this.ActorModel.findOne({ slug });

    if (!actor) {
      throw new NotFoundException('Actor not found');
    }

    return actor;
  }

  async getAll(searchTerm?: string) {
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
        ],
      };
    }

    return this.ActorModel.aggregate()
      .match(options)
      .lookup({
        from: 'Movie',
        localField: '_id',
        foreignField: 'actors',
        as: 'movies',
      })
      .addFields({
        countMovies: {
          $size: '$movies',
        },
      })
      .project({ __v: 0, updatedAt: 0, movies: 0 })
      .sort({ createdAt: -1 });
  }

  async byId(_id: string) {
    const actor = await this.ActorModel.findById(_id);

    if (!actor) {
      throw new NotFoundException('Actor not found');
    }

    return actor;
  }

  async create() {
    const defaultValue: ActorDto = {
      name: '',
      slug: '',
      photo: '',
    };

    const actor = await this.ActorModel.create(defaultValue);

    return actor._id;
  }

  async update(_id: string, dto: ActorDto) {
    const actor = await this.ActorModel.findByIdAndUpdate(_id, dto, { new: true });

    if (!actor) {
      throw new BadRequestException('Actor not found');
    }

    return actor;
  }

  async delete(_id: string) {
    const actor = await this.ActorModel.findByIdAndDelete(_id);

    if (!actor) {
      throw new BadRequestException('Actor not found');
    }

    return actor;
  }
}
