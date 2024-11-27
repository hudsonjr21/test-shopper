import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../drivers/entities/driver.entity';
import { Racing } from './entities/racing.entity';
import { EstimateRideDto } from './dto/estimate-ride.dto';
import { ConfirmRideDto } from './dto/confirm-ride.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RacingService {
  private googleMapsClient: Client;

  constructor(
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
    @InjectRepository(Racing)
    private racingRepository: Repository<Racing>,
    private configService: ConfigService,
  ) {
    this.googleMapsClient = new Client({});
  }

  async estimate(estimateRideDto: EstimateRideDto) {
    const { origin, destination, customer_id } = estimateRideDto;

    // Validações
    if (!origin || !destination || !customer_id) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Missing required fields',
      });
    }

    if (origin === destination) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Origin and destination cannot be the same',
      });
    }

    // Obter rota do Google Maps
    const route = await this.googleMapsClient.directions({
      params: {
        origin,
        destination,
        key: this.configService.get('GOOGLE_API_KEY'),
      },
    });

    if (!route.data.routes[0]) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Route not found',
      });
    }

    const distance = route.data.routes[0].legs[0].distance.value / 1000; // em km
    const duration = route.data.routes[0].legs[0].duration.text;

    // Buscar motoristas disponíveis
    const drivers = await this.driversRepository.find();

    // Filtrar e calcular preços
    const options = drivers
      .filter(driver => distance >= driver.minimum_km)
      .map(driver => ({
        id: driver.id,
        name: driver.name,
        description: driver.description,
        vehicle: driver.vehicle,
        review: {
          rating: driver.rating,
          comment: driver.review_comment,
        },
        value: Number((distance * driver.price_per_km).toFixed(2)),
      }))
      .sort((a, b) => a.value - b.value);

    return {
      origin: {
        latitude: route.data.routes[0].legs[0].start_location.lat,
        longitude: route.data.routes[0].legs[0].start_location.lng,
      },
      destination: {
        latitude: route.data.routes[0].legs[0].end_location.lat,
        longitude: route.data.routes[0].legs[0].end_location.lng,
      },
      distance,
      duration,
      options,
      routeResponse: route.data,
    };
  }

  async confirm(confirmRideDto: ConfirmRideDto) {
    const { customer_id, driver, distance } = confirmRideDto;

    // Validar motorista
    const driverEntity = await this.driversRepository.findOne({ where: { id: driver.id } });
    if (!driverEntity) {
      throw new NotFoundException({
        error_code: 'DRIVER_NOT_FOUND',
        error_description: 'Driver not found',
      });
    }

    // Validar distância mínima
    if (distance < driverEntity.minimum_km) {
      throw new BadRequestException({
        error_code: 'INVALID_DISTANCE',
        error_description: `Minimum distance for this driver is ${driverEntity.minimum_km}km`,
      });
    }

    // Salvar corrida
    const racing = this.racingRepository.create({
      ...confirmRideDto,
      date: new Date(),
    });

    await this.racingRepository.save(racing);

    return { success: true };
  }

  async findAllByCustomer(customer_id: string, driver_id?: number) {
    const query = this.racingRepository
      .createQueryBuilder('racing')
      .where('racing.customer_id = :customer_id', { customer_id })
      .orderBy('racing.date', 'DESC');

    if (driver_id) {
      const driver = await this.driversRepository.findOne({ where: { id: driver_id } });
      if (!driver) {
        throw new BadRequestException({
          error_code: 'INVALID_DRIVER',
          error_description: 'Invalid driver id',
        });
      }
      query.andWhere('racing.driver_id = :driver_id', { driver_id });
    }

    const rides = await query.getMany();

    if (!rides.length) {
      throw new NotFoundException({
        error_code: 'NO_RIDES_FOUND',
        error_description: 'No rides found for this customer',
      });
    }

    return {
      customer_id,
      rides,
    };
  }
}
