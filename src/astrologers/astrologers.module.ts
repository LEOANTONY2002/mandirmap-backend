import { Module } from '@nestjs/common';
import { AstrologersService } from './astrologers.service';
import { AstrologersController } from './astrologers.controller';

@Module({
  providers: [AstrologersService],
  controllers: [AstrologersController],
})
export class AstrologersModule {}
