import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 * * * *')
  async removeUnverifiedUsers() {
    await this.prisma.user.deleteMany({
      where: {
        isVerified: false,
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
    });
  }
}
