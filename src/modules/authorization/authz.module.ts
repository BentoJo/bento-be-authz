import { Module } from '@nestjs/common';
import { AuthController } from './authz.controller';
import { CreateRole } from './services/create-role.service';
import { HealthService } from './services/health.service';

@Module({
  controllers: [AuthController],
  providers: [CreateRole, HealthService],
})
export class AuthModule {}
