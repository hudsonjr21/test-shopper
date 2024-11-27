import { IsNotEmpty, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DriverDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;
}

export class ConfirmRideDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  origin: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNumber()
  distance: number;

  @IsString()
  duration: string;

  @ValidateNested()
  @Type(() => DriverDto)
  driver: DriverDto;

  @IsNumber()
  value: number;
}