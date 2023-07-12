import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({
    message: 'RefreshToken should be a string',
  })
  refreshToken: string;
}
