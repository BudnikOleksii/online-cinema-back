import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Auth } from '../auth/decorators/auth.decorator';
import { IdValidationPipe } from '../pipes/id.validation.pipe';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create.genre.dto';

@Controller('genres')
export class GenreController {
  constructor(private readonly GenreService: GenreService) {}

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return this.GenreService.bySlug(slug);
  }

  @Get('collections')
  async getCollections() {
    return this.GenreService.getCollections();
  }

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.GenreService.getAll(searchTerm);
  }

  @Get(':id')
  @Auth('admin')
  async getGenre(@Param('id', IdValidationPipe) _id: string) {
    return this.GenreService.byId(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(201)
  @Auth('admin')
  async createGenre() {
    return this.GenreService.create();
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('admin')
  async updateGenre(@Param('id', IdValidationPipe) _id: string, @Body() dto: CreateGenreDto) {
    return this.GenreService.update(_id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async deleteGenre(@Param('id', IdValidationPipe) _id: string) {
    return this.GenreService.delete(_id);
  }
}
