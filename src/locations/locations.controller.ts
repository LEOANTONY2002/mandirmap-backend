import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Category } from '@prisma/client';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll(
    @Query('category') category?: Category,
    @Query('deityId') deityId?: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.locationsService.findAll(lang, category, deityId);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.locationsService.search(lang, query);
  }

  @Get('deities')
  async getDeities(@Headers('accept-language') lang: string = 'en') {
    return this.locationsService.getDeities(lang);
  }

  @Get('districts')
  async getDistricts(@Headers('accept-language') lang: string = 'en') {
    return this.locationsService.getDistricts(lang);
  }

  @Get('festivals')
  async getFestivals(
    @Query('district') district?: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.locationsService.getFestivals(lang, district);
  }

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('category') category?: Category,
    @Query('deityId') deityId?: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.locationsService.findNearby(
      lang,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : 5000,
      category,
      deityId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return this.locationsService.getTempleDetails(lang, id);
  }
}
