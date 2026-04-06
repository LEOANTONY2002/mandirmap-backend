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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  listUsers(
    @Query('search') search?: string,
    @Query('state') state?: string,
    @Query('language') language?: string,
    @Query('hasAvatar') hasAvatar?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listUsers({
      search,
      state,
      language,
      hasAvatar,
      page,
      pageSize,
    });
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Get('locations')
  listLocations(
    @Query('category') category?: Category,
    @Query('search') search?: string,
    @Query('district') district?: string,
    @Query('state') state?: string,
    @Query('hasMedia') hasMedia?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listLocations({
      category,
      search,
      district,
      state,
      hasMedia,
      page,
      pageSize,
    });
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
  listDeities(
    @Query('search') search?: string,
    @Query('hasPhoto') hasPhoto?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listDeities({ search, hasPhoto, page, pageSize });
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
  listAmenities(
    @Query('search') search?: string,
    @Query('hasImage') hasImage?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listAmenities({ search, hasImage, page, pageSize });
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
  listFestivals(
    @Query('search') search?: string,
    @Query('locationId') locationId?: string,
    @Query('deityId') deityId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listFestivals({
      search,
      locationId,
      deityId,
      status,
      page,
      pageSize,
    });
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
  listAstrologers(
    @Query('search') search?: string,
    @Query('state') state?: string,
    @Query('district') district?: string,
    @Query('verified') verified?: string,
    @Query('hasAvatar') hasAvatar?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.listAstrologers({
      search,
      state,
      district,
      verified,
      hasAvatar,
      page,
      pageSize,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.adminService.uploadAsset(file, folder);
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
