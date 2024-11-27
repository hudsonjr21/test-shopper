import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './modules/drivers/drivers.module';
import { PassengersModule } from './modules/passengers/passengers.module';
import { RacingModule } from './modules/racing/racing.module';

@Module({
  imports: [DriversModule, PassengersModule, RacingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
