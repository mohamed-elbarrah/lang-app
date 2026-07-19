import { IsOptional, IsInt, Min, Max, IsArray, IsUUID, IsEnum, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(50)
  questionCount?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(20)
  partIds?: string[];

  @IsOptional()
  @IsEnum(['instant', 'final'])
  correctionMode?: 'instant' | 'final';
}
