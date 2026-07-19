import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateAiProviderDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  apiKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  baseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  defaultModel?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
