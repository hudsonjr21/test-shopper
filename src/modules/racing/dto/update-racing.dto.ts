import { PartialType } from '@nestjs/mapped-types';
import { CreateRacingDto } from './create-racing.dto';

export class UpdateRacingDto extends PartialType(CreateRacingDto) {}
