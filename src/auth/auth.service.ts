import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dtos/loginUser.dto';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ userName, email, password }: RegisterUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { userName }],
      },
    });

    if (existingUser) {
      throw new HttpException(
        'Email or username is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        isAdmin: false,
      },
    });

    return this.generateUserResponse(user);
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return {
      user: this.generateUserResponse(user),
      access_token: this.jwtService.sign(payload),
    };
  }

  private generateUserResponse(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
