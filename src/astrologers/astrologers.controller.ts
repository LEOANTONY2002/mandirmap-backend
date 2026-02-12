import { Controller, Get, Query, Param } from '@nestjs/common';
import { AstrologersService } from './astrologers.service';

@Controller('astrologers')
export class AstrologersController {
  constructor(private readonly astrologersService: AstrologersService) {}

  @Get()
  async findAll() {
    return this.astrologersService.findAll();
  }

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.astrologersService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : 20000,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.astrologersService.findOne(id);
  }
}
