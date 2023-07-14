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
import { ActorService } from './actor.service';
import { ActorDto } from './actor.dto';

@Controller('actors')
export class ActorController {
  constructor(private readonly ActorService: ActorService) {}

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return this.ActorService.bySlug(slug);
  }

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.ActorService.getAll(searchTerm);
  }

  @Get(':id')
  @Auth('admin')
  async getGenre(@Param('id', IdValidationPipe) _id: string) {
    return this.ActorService.byId(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(201)
  @Auth('admin')
  async createGenre() {
    return this.ActorService.create();
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('admin')
  async updateGenre(@Param('id', IdValidationPipe) _id: string, @Body() dto: ActorDto) {
    return this.ActorService.update(_id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async deleteGenre(@Param('id', IdValidationPipe) _id: string) {
    return this.ActorService.delete(_id);
  }
}
