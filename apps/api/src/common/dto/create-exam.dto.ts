import { IsOptional, IsInt, Min, Max, IsArray, IsUUID, IsEnum, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @IsNotEmpty()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level: 'beginner' | 'intermediate' | 'advanced';

  @ArrayNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  lessonIds: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(50)
  questionCount?: number;

  @IsOptional()
  @IsEnum(['instant', 'final'])
  correctionMode?: 'instant' | 'final';
}
