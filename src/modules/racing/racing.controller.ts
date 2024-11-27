import { Controller, Post, Body, Patch, Get, Param, Query } from '@nestjs/common';
import { RacingService } from './racing.service';
import { EstimateRideDto } from './dto/estimate-ride.dto';
import { ConfirmRideDto } from './dto/confirm-ride.dto';

@Controller('ride')
export class RacingController {
  constructor(private readonly racingService: RacingService) {}

  @Post('estimate')
  estimate(@Body() estimateRideDto: EstimateRideDto) {
    return this.racingService.estimate(estimateRideDto);
  }

  @Patch('confirm')
  confirm(@Body() confirmRideDto: ConfirmRideDto) {
    return this.racingService.confirm(confirmRideDto);
  }

  @Get(':customer_id')
  findAll(
    @Param('customer_id') customer_id: string,
    @Query('driver_id') driver_id?: number,
  ) {
    return this.racingService.findAllByCustomer(customer_id, driver_id);
  }
}
