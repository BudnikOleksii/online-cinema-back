import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ConfigModule } from '@nestjs/config';

import { ActorModel } from './actor.model';
import { ActorService } from './actor.service';
import { ActorController } from './actor.controller';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: ActorModel,
        schemaOptions: {
          collection: 'Actor',
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [ActorService],
  controllers: [ActorController],
})
export class ActorModule {}
