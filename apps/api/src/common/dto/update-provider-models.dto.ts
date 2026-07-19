import { IsArray, ValidateNested, IsUUID, IsBoolean, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ModelUpdateItem {
  @IsUUID('4')
  id: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class UpdateProviderModelsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelUpdateItem)
  @ArrayMinSize(1)
  models: ModelUpdateItem[];
}
