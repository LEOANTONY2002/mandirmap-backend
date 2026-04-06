import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('options')
  getOptions() {
    return this.adminService.getOptions();
  }

  @Get('users')
  listUsers(@Query('search') search?: string) {
    return this.adminService.listUsers(search);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Get('locations')
  listLocations(
    @Query('category') category?: Category,
    @Query('search') search?: string,
  ) {
    return this.adminService.listLocations({ category, search });
  }

  @Get('locations/:id')
  getLocation(@Param('id') id: string) {
    return this.adminService.getLocation(id);
  }

  @Post('locations')
  createLocation(@Body() body: any, @Request() req: any) {
    return this.adminService.createLocation(body, req.user.id);
  }

  @Patch('locations/:id')
  updateLocation(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.adminService.updateLocation(id, body, req.user.id);
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id') id: string) {
    return this.adminService.deleteLocation(id);
  }

  @Get('deities')
  listDeities(@Query('search') search?: string) {
    return this.adminService.listDeities(search);
  }

  @Post('deities')
  createDeity(@Body() body: any) {
    return this.adminService.createDeity(body);
  }

  @Patch('deities/:id')
  updateDeity(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateDeity(Number(id), body);
  }

  @Delete('deities/:id')
  deleteDeity(@Param('id') id: string) {
    return this.adminService.deleteDeity(Number(id));
  }

  @Get('amenities')
  listAmenities(@Query('search') search?: string) {
    return this.adminService.listAmenities(search);
  }

  @Post('amenities')
  createAmenity(@Body() body: any) {
    return this.adminService.createAmenity(body);
  }

  @Patch('amenities/:id')
  updateAmenity(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAmenity(Number(id), body);
  }

  @Delete('amenities/:id')
  deleteAmenity(@Param('id') id: string) {
    return this.adminService.deleteAmenity(Number(id));
  }

  @Get('festivals')
  listFestivals(@Query('search') search?: string) {
    return this.adminService.listFestivals(search);
  }

  @Post('festivals')
  createFestival(@Body() body: any) {
    return this.adminService.createFestival(body);
  }

  @Patch('festivals/:id')
  updateFestival(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateFestival(id, body);
  }

  @Delete('festivals/:id')
  deleteFestival(@Param('id') id: string) {
    return this.adminService.deleteFestival(id);
  }

  @Get('astrologers')
  listAstrologers(@Query('search') search?: string) {
    return this.adminService.listAstrologers(search);
  }

  @Post('astrologers')
  createAstrologer(@Body() body: any) {
    return this.adminService.createAstrologer(body);
  }

  @Patch('astrologers/:id')
  updateAstrologer(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAstrologer(id, body);
  }

  @Delete('astrologers/:id')
  deleteAstrologer(@Param('id') id: string) {
    return this.adminService.deleteAstrologer(id);
  }
}
