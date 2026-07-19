import { IsString, IsOptional, IsInt, IsArray, IsUUID, MaxLength } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsUUID('4')
  partId?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  definition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rule?: string;

  @IsOptional()
  @IsArray()
  examples?: string[];
}
