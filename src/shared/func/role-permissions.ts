import { and, eq, inArray } from 'drizzle-orm';
import db from '../configs/db.config';
import {
  permissions,
  rolePermissions,
  systemRolePermissions,
} from '../db/schema';

export type RolePermissionRow = typeof rolePermissions.$inferSelect;
export type NewRolePermissionRow = typeof rolePermissions.$inferInsert;

export async function getPermissionsForRole(roleId: string): Promise<string[]> {
  const rows = await db
    .select({ permissionName: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));

  return rows.map((row) => row.permissionName);
}

export async function getPermissionsForSystemRole(
  systemRoleId: string,
): Promise<string[]> {
  if (!systemRoleId) return [];

  const rows = await db
    .select({ permissionName: permissions.name })
    .from(systemRolePermissions)
    .innerJoin(
      permissions,
      eq(systemRolePermissions.permissionId, permissions.id),
    )
    .where(eq(systemRolePermissions.systemRoleId, systemRoleId));

  return rows.map((row) => row.permissionName);
}

export async function getPermissionIdsForRole(
  roleId: string,
): Promise<string[]> {
  const rows = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  return rows.map((row) => row.permissionId);
}

export async function getRolesForPermission(
  permissionId: string,
): Promise<string[]> {
  const rows = await db
    .select({ roleId: rolePermissions.roleId })
    .from(rolePermissions)
    .where(eq(rolePermissions.permissionId, permissionId));

  return rows.map((row) => row.roleId);
}

export async function rolePermissionExists(
  roleId: string,
  permissionId: string,
): Promise<boolean> {
  const [row] = await db
    .select({
      roleId: rolePermissions.roleId,
      permissionId: rolePermissions.permissionId,
    })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    );

  return Boolean(row);
}

export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
): Promise<void> {
  await db
    .insert(rolePermissions)
    .values({ roleId, permissionId })
    .onConflictDoNothing();
}

export async function assignPermissionsToRoleQuery(
  roleId: string,
  permissionIds: string[],
  tx?: typeof db,
): Promise<void> {
  if (permissionIds.length === 0) {
    return;
  }

  const executor = tx ?? db;
  await executor
    .insert(rolePermissions)
    .values(permissionIds.map((permissionId) => ({ roleId, permissionId })))
    .onConflictDoNothing();
}

export async function removePermissionFromRole(
  roleId: string,
  permissionId: string,
): Promise<boolean> {
  const result = await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    )
    .returning({ roleId: rolePermissions.roleId });

  return result.length > 0;
}

export async function removePermissionsFromRole(
  roleId: string,
  permissionIds: string[],
  tx?: typeof db,
): Promise<number> {
  if (permissionIds.length === 0) {
    return 0;
  }

  const executor = tx ?? db;
  const result = await executor
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        inArray(rolePermissions.permissionId, permissionIds),
      ),
    )
    .returning({ roleId: rolePermissions.roleId });

  return result.length;
}

export async function clearRolePermissions(roleId: string): Promise<number> {
  const result = await db
    .delete(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))
    .returning({ roleId: rolePermissions.roleId });

  return result.length;
}

export async function listRolePermissionPairs(): Promise<RolePermissionRow[]> {
  return db.select().from(rolePermissions);
}

export async function listRolePermissionPairsByRoleIds(
  roleIds: string[],
): Promise<RolePermissionRow[]> {
  if (roleIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(rolePermissions)
    .where(inArray(rolePermissions.roleId, roleIds));
}
