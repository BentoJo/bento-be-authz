import { Module } from '@nestjs/common';
import { AuthModule } from './authorization/authz.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
