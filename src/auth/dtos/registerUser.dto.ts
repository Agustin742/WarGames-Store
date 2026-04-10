import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
