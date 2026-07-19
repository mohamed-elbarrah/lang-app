import { IsEnum } from 'class-validator';

export class UpdateExamModeDto {
  @IsEnum(['instant', 'final'])
  correctionMode: 'instant' | 'final';
}
