import { IsString, IsInt, IsArray, IsUUID, MaxLength, ArrayMinSize } from 'class-validator';

export class CreateLessonDto {
  @IsUUID('4')
  partId: string;

  @IsInt()
  order: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(1000)
  definition: string;

  @IsString()
  @MaxLength(2000)
  rule: string;

  @IsArray()
  @ArrayMinSize(1)
  examples: string[];
}
