import { IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsInt()
  categoryId!: number;
}
