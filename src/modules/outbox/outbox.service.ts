// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import {
//   listUnsentOutboxEvents,
//   markOutboxEventSent,
//   insertEventAudit,
// } from '../../shared/func/outbox';
// import { RedisService } from '../redis/redis.service';

// @Injectable()
// export class OutboxService implements OnModuleInit, OnModuleDestroy {
//   private intervalId?: NodeJS.Timeout;

//   constructor(private readonly redisService: RedisService) {}

//   onModuleInit() {
//     // start polling every 2s
//     this.intervalId = setInterval(() => {
//       void this.poll();
//     }, 2000);
//   }

//   onModuleDestroy() {
//     if (this.intervalId) clearInterval(this.intervalId);
//   }

//   async poll() {
//     try {
//       const events = await listUnsentOutboxEvents(50);
//       for (const e of events) {
//         try {
//           // const payload = e.payload;
//           // const channel = 'authz.events';
//           // await this.redisService.publish(channel, payload);
//           await markOutboxEventSent(e.id);
//           await insertEventAudit(e.id, 'outbox-poller', 'success');
//         } catch {
//           await insertEventAudit(e.id, 'outbox-poller', 'failed');
//         }
//       }
//     } catch (err) {
//       // log and ignore
//       console.error('Outbox poller error', err);
//     }
//   }
// }
