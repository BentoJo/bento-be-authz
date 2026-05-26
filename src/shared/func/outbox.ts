// import db from '../configs/db.config';
// import { outboxEvents, eventAudit } from '../db/schema';
// import { eq } from 'drizzle-orm';

// export interface OutboxEvent {
//   eventId: string;
//   eventType: string;
//   scopeType: string;
//   scopeId: string;
//   payload: any;
//   createdAt?: Date;
// }

// export async function insertOutboxEvent(event: OutboxEvent, tx?: typeof db) {
//   const executor = tx ?? db;
//   await executor.insert(outboxEvents).values({
//     eventId: event.eventId,
//     eventType: event.eventType,
//     scopeType: event.scopeType,
//     scopeId: event.scopeId,
//     payload: JSON.stringify(event.payload),
//     isSent: false,
//     createdAt: event.createdAt ?? new Date(),
//   });
// }

// export async function listUnsentOutboxEvents(limit = 100) {
//   const rows = await db
//     .select()
//     .from(outboxEvents)
//     .where(eq(outboxEvents.isSent, false))
//     .limit(limit);
//   return rows;
// }

// export async function markOutboxEventSent(id: string) {
//   await db
//     .update(outboxEvents)
//     .set({ isSent: true, sentAt: new Date() })
//     .where(eq(outboxEvents.id, id));
// }

// export async function insertEventAudit(
//   eventId: string,
//   consumer: string,
//   status: string,
// ) {
//   await db.insert(eventAudit).values({
//     outboxEventId: eventId,
//     consumerId: consumer,
//     consumedAt: new Date(),
//     status,
//   });
// }
