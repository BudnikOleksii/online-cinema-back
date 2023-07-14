import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieModel } from './movie.model';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: MovieModel,
        schemaOptions: {
          collection: 'Movie',
        },
      },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}
