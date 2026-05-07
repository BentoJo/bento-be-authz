import { eq, inArray } from 'drizzle-orm';
import db from '../configs/db.config';
import { permissions } from '../db/schema';

export type PermissionRow = typeof permissions.$inferSelect;
export type NewPermissionRow = typeof permissions.$inferInsert;

export async function getPermissionById(
  permissionId: string,
): Promise<PermissionRow | null> {
  const [row] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, permissionId));
  return row ?? null;
}

export async function getPermissionByName(
  permissionName: string,
): Promise<PermissionRow | null> {
  const [row] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.name, permissionName));
  return row ?? null;
}

export async function permissionExistsById(
  permissionId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.id, permissionId));
  return Boolean(row);
}

export async function permissionExistsByName(
  permissionName: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, permissionName));
  return Boolean(row);
}

export async function listPermissions(): Promise<PermissionRow[]> {
  return db.select().from(permissions);
}

export async function listPermissionsByIds(
  permissionIds: string[],
): Promise<PermissionRow[]> {
  if (permissionIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(permissions)
    .where(inArray(permissions.id, permissionIds));
}

export async function PermissionsExistsByIds(
  permissionIds: string[],
): Promise<boolean> {
  if (permissionIds.length === 0) {
    return false;
  }

  const rows = await db
    .select()
    .from(permissions)
    .where(inArray(permissions.id, permissionIds));
  return rows.length > 0;
}

export async function createPermission(
  data: NewPermissionRow,
): Promise<PermissionRow> {
  const [row] = await db.insert(permissions).values(data).returning();
  if (!row) {
    throw new Error('Failed to create permission');
  }

  return row;
}

export async function updatePermission(
  permissionId: string,
  data: Partial<NewPermissionRow>,
): Promise<PermissionRow | null> {
  const [row] = await db
    .update(permissions)
    .set(data)
    .where(eq(permissions.id, permissionId))
    .returning();
  return row ?? null;
}

export async function deletePermission(permissionId: string): Promise<boolean> {
  const result = await db
    .delete(permissions)
    .where(eq(permissions.id, permissionId))
    .returning({ id: permissions.id });
  return result.length > 0;
}
