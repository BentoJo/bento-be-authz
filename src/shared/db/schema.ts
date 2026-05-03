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

  name: varchar('name', { length: 255 }).notNull(),

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
