import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsString() description!: string;
  @IsInt() @Min(0) priceCents!: number;
  @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) priceCents?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
