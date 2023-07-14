import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { Auth } from '../auth/decorators/auth.decorator';
import { IdValidationPipe } from '../pipes/id.validation.pipe';
import { MovieService } from './movie.service';
import { UpdateMovieDto } from './update-movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly MovieService: MovieService) {}

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return this.MovieService.bySlug(slug);
  }

  @Get('by-actor/:actorId')
  async byActorId(@Param('actorId', IdValidationPipe) actorId: Types.ObjectId) {
    return this.MovieService.byActorId(actorId);
  }

  @Post('by-genres')
  @HttpCode(200)
  async byGenres(@Body('genresIds') genresIds: Types.ObjectId[]) {
    return this.MovieService.byGenres(genresIds);
  }

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.MovieService.getAll(searchTerm);
  }

  @Get('most-popular')
  async getMostPopular() {
    return this.MovieService.getMostPopular();
  }

  @Patch('update-count-opened')
  @HttpCode(200)
  async updateCountOpened(@Body('slug') slug: string) {
    return this.MovieService.updateCountOpened(slug);
  }

  @Get(':id')
  @Auth('admin')
  async getMovieById(@Param('id', IdValidationPipe) _id: string) {
    return this.MovieService.byId(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(201)
  @Auth('admin')
  async createMovie() {
    return this.MovieService.create();
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('admin')
  async updateMovie(@Param('id', IdValidationPipe) _id: string, @Body() dto: UpdateMovieDto) {
    return this.MovieService.update(_id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async deleteMovie(@Param('id', IdValidationPipe) _id: string) {
    return this.MovieService.delete(_id);
  }
}
