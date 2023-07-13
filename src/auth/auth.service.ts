import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { JwtService } from '@nestjs/jwt';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { hash, genSalt, compare } from 'bcryptjs';

import { UserModel } from '../user/user.model';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: AuthDto) {
    const candidate = await this.UserModel.findOne({ email: dto.email });

    if (candidate) {
      throw new BadRequestException('User with current email already exists');
    }

    const salt = await genSalt(10);

    const newUser = new this.UserModel({
      email: dto.email,
      password: await hash(dto.password, salt),
    });
    const user = await newUser.save();

    const tokens = await this.issueTokensPair(String(user._id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issueTokensPair(String(user._id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async refreshTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new UnauthorizedException('Please, sign in!');
    }

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) {
      throw new UnauthorizedException('Invalid token or expired');
    }

    const user = await this.UserModel.findById(result._id);
    const tokens = await this.issueTokensPair(String(user._id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async validateUser(dto: AuthDto): Promise<UserModel> {
    const user = await this.UserModel.findOne({ email: dto.email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password or email');
    }

    return user;
  }

  async issueTokensPair(userId: string) {
    const data = { _id: userId };

    const refreshToken = await this.jwtService.signAsync(data, { expiresIn: '15d' });
    const accessToken = await this.jwtService.signAsync(data, { expiresIn: '1d' });

    return { refreshToken, accessToken };
  }

  returnUserFields(user: UserModel) {
    return {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }
}
