import { Module } from '@nestjs/common';
import { AuthController } from './authz.controller';
import { HealthService } from './services/health.service';

@Module({
  controllers: [AuthController],
  providers: [HealthService],
})
export class AuthModule {}
