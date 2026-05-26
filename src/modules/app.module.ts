import { Module } from '@nestjs/common';
import { AuthModule } from './authorization/authz.module';
import { RedisModule } from '../modules/redis/redis.module';
// import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [RedisModule, AuthModule],
})
export class AppModule {}
