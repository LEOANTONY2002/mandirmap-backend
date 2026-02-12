import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType } from '@prisma/client';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get<string>(
      'CLOUDFLARE_R2_BUCKET_NAME',
    )!;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'CLOUDFLARE_ACCESS_KEY_ID',
        )!,
        secretAccessKey: this.configService.get<string>(
          'CLOUDFLARE_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  async getReels(skip: number, take: number) {
    return this.prisma.mediaContent.findMany({
      where: { type: MediaType.VIDEO },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        location: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async uploadAndSave(
    file: Express.Multer.File,
    type: MediaType,
    locationId?: string,
  ) {
    const key = `media/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.configService.get('CLOUDFLARE_R2_PUBLIC_DOMAIN')}/${key}`;

    // For now we placeholder the user ID since we need a user in DB to link
    // In production, this would come from the AuthGuard's decoded token
    const firstUser = await this.prisma.user.findFirst();
    if (!firstUser) throw new Error('No user found to attribute media to');

    return this.prisma.mediaContent.create({
      data: {
        url,
        type,
        locationId,
        uploaderId: firstUser.id,
        thumbnailUrl:
          type === MediaType.VIDEO ? url.replace('.mp4', '.jpg') : null, // Simplistic placeholder
      },
    });
  }
}
