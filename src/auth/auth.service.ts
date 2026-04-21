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
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { EmailService } from 'src/email/email.service';
import { ResendVerificationDto } from './dtos/resendVerification.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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
    const code = this.generateCode();

    await this.prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        isAdmin: false,
        isVerified: false,
        verificationCode: code,
        verificationCodeExpires: new Date(Date.now() + 1000 * 60 * 10),
      },
    });

    await this.emailService.sendVerificationEmail(email, code);

    return {
      message: 'User created. Verify your email.',
    };
  }

  async resendVerification({ email }: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If the email exists, a verification was sent' };
    }

    if (user.isVerified) {
      return { message: 'Account already verified' };
    }

    const now = new Date();

    if (user.verificationCodeExpires && user.verificationCodeExpires > now) {
      throw new HttpException(
        'Wait before requesting a new code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateCode();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpires: new Date(Date.now() + 1000 * 60 * 10),
      },
    });

    await this.emailService.sendVerificationEmail(email, code);

    return {
      message: 'Verification email sent',
    };
  }

  async verifyEmail({ email, code }: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    }

    if (user.isVerified) {
      return { message: 'Already verified' };
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new HttpException(
        'Invalid or expirated code',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
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

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
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

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
