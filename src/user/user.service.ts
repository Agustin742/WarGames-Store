import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  createUser({ userName, email, password, isAdmin }: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        userName,
        email,
        password,
        isAdmin,
      },
    });
  }
}
