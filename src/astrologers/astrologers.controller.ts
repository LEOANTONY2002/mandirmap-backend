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
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('district') district?: string,
    @Query('radius') radius?: string,
  ) {
    if (lat && lng) {
      return this.astrologersService.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius) : 20000,
      );
    } else if (district) {
      return this.astrologersService.findByDistrict(district);
    }
    return this.astrologersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.astrologersService.findOne(id);
  }
}
