import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateFcmToken(firebaseUid: string, fcmToken: string) {
    return this.prisma.user.update({
      where: { firebaseUid },
      data: { fcmToken },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }
}
