import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LocationsModule } from './locations/locations.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { AstrologersModule } from './astrologers/astrologers.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    LocationsModule,
    MediaModule,
    AstrologersModule,
    FavoritesModule,
  ],
})
export class AppModule {}
