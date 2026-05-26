import { and, eq, inArray } from 'drizzle-orm';
import db from '../configs/db.config';
import {
  permissions,
  rolePermissions,
  roles,
  scopeTypeEnum,
} from '../db/schema';
import { Role, UserRole } from '../types/types';

export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;

export async function getRoleById(
  roleId: string,
  tx?: typeof db,
): Promise<RoleRow | null> {
  const executor = tx ?? db;
  const [row] = await executor.select().from(roles).where(eq(roles.id, roleId));
  return row ?? null;
}

export async function listRolesByScope(
  scopeType: (typeof scopeTypeEnum.enumValues)[number],
  scopeId: string,
  includeSystemRoles = true,
): Promise<Role[]> {
  const conditions = [
    eq(roles.scopeType, scopeType),
    eq(roles.scopeId, scopeId),
  ];

  if (!includeSystemRoles) {
    conditions.push(eq(roles.isSystem, false));
  }

  return db
    .select({
      id: roles.id,
      name: roles.name,
      isSystem: roles.isSystem,
      isEditable: roles.isEditable,
      isDeletable: roles.isDeletable,
    })
    .from(roles)
    .where(and(...conditions)) as Promise<Role[]>;
}

export async function listSystemRoles(
  scopeType: (typeof scopeTypeEnum.enumValues)[number],
  scopeId: string,
): Promise<RoleRow[]> {
  return db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.scopeType, scopeType),
        eq(roles.scopeId, scopeId),
        eq(roles.isSystem, true),
      ),
    );
}

export async function listEditableRoles(
  scopeType: (typeof scopeTypeEnum.enumValues)[number],
  scopeId: string,
): Promise<RoleRow[]> {
  return db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.scopeType, scopeType),
        eq(roles.scopeId, scopeId),
        eq(roles.isEditable, true),
      ),
    );
}

export async function listDeletableRoles(
  scopeType: (typeof scopeTypeEnum.enumValues)[number],
  scopeId: string,
): Promise<RoleRow[]> {
  return db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.scopeType, scopeType),
        eq(roles.scopeId, scopeId),
        eq(roles.isDeletable, true),
      ),
    );
}

export async function listRolesByIds(roleIds: string[]): Promise<RoleRow[]> {
  if (roleIds.length === 0) {
    return [];
  }

  return db.select().from(roles).where(inArray(roles.id, roleIds));
}

export async function roleExists(roleId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.id, roleId));
  return Boolean(row);
}

export async function roleExistsByName(
  roleName: string,
  scopeType?: (typeof scopeTypeEnum.enumValues)[number],
  scopeId?: string,
): Promise<boolean> {
  const conditions: ReturnType<typeof eq>[] = [eq(roles.name, roleName)];

  // If scope provided, scope the uniqueness check to that scope (recommended)
  if (scopeType !== undefined) {
    conditions.push(eq(roles.scopeType, scopeType));
  }

  if (scopeId !== undefined) {
    conditions.push(eq(roles.scopeId, scopeId));
  }

  const [row] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(...conditions));
  return Boolean(row);
}

export async function createRoleQuery(
  data: NewRoleRow,
  tx?: typeof db,
): Promise<RoleRow> {
  const executor = tx ?? db;
  const [row] = await executor.insert(roles).values(data).returning();
  if (!row) {
    throw new Error('Failed to create role');
  }

  return row;
}

export async function updateRoleQuery(
  roleId: string,
  data: Partial<NewRoleRow>,
  tx?: typeof db,
): Promise<RoleRow | null> {
  const executor = tx ?? db;
  const [row] = await executor
    .update(roles)
    .set(data)
    .where(eq(roles.id, roleId))
    .returning();
  return row ?? null;
}

export async function deleteRoleQuery(
  roleId: string,
  tx?: typeof db,
): Promise<boolean> {
  const executor = tx ?? db;
  const result = await executor
    .delete(roles)
    .where(eq(roles.id, roleId))
    .returning({ id: roles.id });
  return result.length > 0;
}

export async function getRolesByIdsAndScope(
  roleIds: string[],
  scopeType: (typeof scopeTypeEnum.enumValues)[number],
  scopeId: string,
  includeSystemRoles = true,
): Promise<UserRole[]> {
  if (!roleIds.length) return [];

  const conditions = [
    inArray(roles.id, roleIds),
    eq(roles.scopeType, scopeType),
    eq(roles.scopeId, scopeId),
  ];

  if (!includeSystemRoles) {
    conditions.push(eq(roles.isSystem, false));
  }

  const rows = await db
    .select({
      id: roles.id,
      name: roles.name,
      isSystem: roles.isSystem,
      permission: permissions.name,
    })
    .from(roles)
    .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(...conditions));

  const rolesMap = new Map<
    string,
    Omit<UserRole, 'permissions'> & {
      permissions: Set<string>;
    }
  >();

  for (const row of rows) {
    if (!rolesMap.has(row.id)) {
      rolesMap.set(row.id, {
        id: row.id,
        name: row.name,
        permissions: new Set<string>(),
        isSystem: row.isSystem ?? false,
      });
    }

    if (row.permission) {
      rolesMap.get(row.id)!.permissions.add(row.permission);
    }
  }

  return Array.from(rolesMap.values()).map((r) => ({
    ...r,
    permissions: Array.from(r.permissions),
  }));
}
