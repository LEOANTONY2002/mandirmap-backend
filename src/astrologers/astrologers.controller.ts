import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AstrologersService } from './astrologers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async addReview(
    @Param('id') id: string,
    @Req() req,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    const userId = req.user.id;
    return this.astrologersService.addReview(id, userId, rating, comment);
  }

  @Put(':id/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Req() req,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    const userId = req.user.id;
    return this.astrologersService.updateReview(
      reviewId,
      id,
      userId,
      rating,
      comment,
    );
  }

  @Delete(':id/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.astrologersService.deleteReview(reviewId, id, userId);
  }
}
