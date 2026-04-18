import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  userName!: string;
}
