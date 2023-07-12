import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';

import { UserModel } from './user.model';

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
}