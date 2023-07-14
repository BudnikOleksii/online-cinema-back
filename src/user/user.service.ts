import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';

import { UserModel } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>) {}

  async byId(_id) {
    const user = await this.UserModel.findById(_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(_id: string, dto: UpdateUserDto) {
    const user = await this.byId(_id);
    const isSameUser = await this.UserModel.findOne({ email: dto.email });

    if (isSameUser && String(_id) !== String(isSameUser._id)) {
      throw new BadRequestException('Email is already in use');
    }

    if (dto.password) {
      const salt = await genSalt(10);
      user.password = await hash(dto.password, salt);
    }

    user.email = dto.email;

    if (dto.isAdmin || dto.isAdmin === false) {
      user.isAdmin = dto.isAdmin;
    }

    return user.save();
  }

  getCount() {
    return this.UserModel.countDocuments();
  }

  getAll(searchTerm?: string) {
    let options = {};

    if (searchTerm) {
      options = {
        $or: [
          {
            email: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    }

    return this.UserModel.find(options)
      .select('-password -updatedAt -__v')
      .sort({ createdAt: 'desc' });
  }

  delete(id: string) {
    return this.UserModel.findByIdAndDelete(id);
  }

  async toggleFavorite(movieId: Types.ObjectId, user: UserModel) {
    const { _id, favorites } = user;

    return this.UserModel.findByIdAndUpdate(
      _id,
      {
        favorites: favorites.includes(movieId)
          ? favorites.filter((id) => String(id) !== String(movieId))
          : [...favorites, movieId],
      },
      { new: true }
    );
  }

  async getFavoriteMovies(_id: Types.ObjectId) {
    return this.UserModel.findById(_id, 'favorites')
      .populate({
        path: 'favorites',
        populate: {
          path: 'genres',
        },
      })
      .then((data) => data.favorites);
  }
}
