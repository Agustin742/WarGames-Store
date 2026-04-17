import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class ItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateWhatsappOrder {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
