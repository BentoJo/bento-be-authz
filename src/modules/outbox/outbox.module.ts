import { Module } from '@nestjs/common';
// import { OutboxService } from './outbox.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  // providers: [OutboxService],
  // exports: [OutboxService],
})
export class OutboxModule {}
