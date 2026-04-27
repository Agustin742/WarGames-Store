import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { ResendVerificationDto } from './dtos/resendVerification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body('user') registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  login(@Body('user') loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('resend-verification')
  resend(@Body('user') dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }
}
