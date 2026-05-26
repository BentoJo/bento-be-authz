import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const iam = pgTable('iam', {
  userId: uuid('user_id').primaryKey(),
});

/**
 * Scope Type Enum (better than raw varchar)
 */
export const scopeTypeEnum = pgEnum('scope_type', [
  'workspace',
  'organization',
  'project',
  'inventory',
]);

/**
 * Roles Table
 */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', { length: 255 }).notNull().unique(),

  scopeType: scopeTypeEnum('scope_type').notNull(),

  scopeId: uuid('scope_id').notNull(),

  isSystem: boolean('is_system').default(false),

  isDeletable: boolean('is_deletable').default(true),

  isEditable: boolean('is_editable').default(true),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => iam.userId),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Permissions Table
 */
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', { length: 255 }).notNull().unique(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Role Permissions (Many-to-Many)
 */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.roleId, table.permissionId],
    }),
  }),
);

// /**
//  * Outbox Events Table
//  */
// export const outboxEvents = pgTable('outbox_events', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   eventId: varchar('event_id', { length: 255 }).notNull().unique(),
//   eventType: varchar('event_type', { length: 100 }).notNull(),
//   scopeType: varchar('scope_type', { length: 50 }).notNull(),
//   scopeId: uuid('scope_id').notNull(),
//   payload: varchar('payload', { length: 10000 }).notNull(),
//   isSent: boolean('is_sent').default(false),
//   sentAt: timestamp('sent_at', { withTimezone: true }),
//   createdAt: timestamp('created_at', { withTimezone: true })
//     .defaultNow()
//     .notNull(),
// });

// /**
//  * Event Audit Table
//  */
// export const eventAudit = pgTable('event_audit', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   outboxEventId: uuid('outbox_event_id')
//     .notNull()
//     .references(() => outboxEvents.id),
//   consumerId: varchar('consumer_id', { length: 255 }).notNull(),
//   consumedAt: timestamp('consumed_at', { withTimezone: true })
//     .defaultNow()
//     .notNull(),
//   status: varchar('status', { length: 50 }).notNull(),
// });
