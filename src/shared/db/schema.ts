import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  primaryKey,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

/* =========================
   IAM
========================= */

export const iam = pgTable('iam', {
  userId: uuid('user_id').primaryKey(),
});

/* =========================
   ENUMS
========================= */

export const scopeTypeEnum = pgEnum('scope_type', [
  'workspace',
  'organization',
  'project',
  'inventory',
]);

export const permissionCategoryEnum = pgEnum('permission_category', [
  'workspace',
  'security',
  'teams',
  'boards',
  'cards',
]);

/* =========================
   PERMISSIONS
========================= */

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 255 }).notNull().unique(),

    description: text('description'),

    category: permissionCategoryEnum('category').notNull(),

    resource: varchar('resource', { length: 100 }).notNull(),

    action: varchar('action', { length: 50 }).notNull(),
  },
  (table) => [
    index('permissions_category_idx').on(table.category),

    index('permissions_resource_idx').on(table.resource),

    index('permissions_action_idx').on(table.action),
  ],
);

/* =========================
   SYSTEM ROLES
========================= */

export const systemRoles = pgTable('system_roles', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name', { length: 255 }).notNull().unique(),

  isSystem: boolean('is_system').default(true),
});

/* =========================
   SYSTEM ROLE PERMISSIONS
========================= */

export const systemRolePermissions = pgTable(
  'system_role_permissions',
  {
    systemRoleId: uuid('system_role_id')
      .notNull()
      .references(() => systemRoles.id, {
        onDelete: 'cascade',
      }),

    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.systemRoleId, table.permissionId],
    }),
  ],
);

/* =========================
   ROLES
========================= */

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    scopeType: scopeTypeEnum('scope_type').notNull(),

    scopeId: uuid('scope_id').notNull(),

    systemRoleId: uuid('system_role_id').references(() => systemRoles.id),

    name: varchar('name', { length: 255 }).notNull(),

    isSystem: boolean('is_system').default(false),

    isDeletable: boolean('is_deletable').default(true),

    isEditable: boolean('is_editable').default(true),

    createdBy: uuid('created_by').references(() => iam.userId),

    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('roles_scope_idx').on(table.scopeType, table.scopeId),

    index('roles_name_scope_unique').on(table.name, table.scopeId),

    index('roles_system_role_idx').on(table.systemRoleId),
  ],
);

/* =========================
   CUSTOM ROLE PERMISSIONS
========================= */

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),

    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionId],
    }),
  ],
);
