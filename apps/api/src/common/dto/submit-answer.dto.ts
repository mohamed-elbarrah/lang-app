import { IsUUID, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID('4')
  questionId: string;

  @IsNotEmpty()
  answer: unknown;
}
