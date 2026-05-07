import { and, eq, inArray } from 'drizzle-orm';
import db from '../configs/db.config';
import { roles } from '../db/schema';
import { Role } from '../types/types';

export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;

export async function getRoleById(roleId: string): Promise<RoleRow | null> {
  const [row] = await db.select().from(roles).where(eq(roles.id, roleId));
  return row ?? null;
}

export async function listRolesByScope(
  scopeType: RoleRow['scopeType'],
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
  scopeType: RoleRow['scopeType'],
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
  scopeType: RoleRow['scopeType'],
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
  scopeType: RoleRow['scopeType'],
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

export async function roleExistsByName(roleName: string): Promise<boolean> {
  const [row] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, roleName));
  return Boolean(row);
}

export async function createRoleQuery(data: NewRoleRow): Promise<RoleRow> {
  const [row] = await db.insert(roles).values(data).returning();
  if (!row) {
    throw new Error('Failed to create role');
  }

  return row;
}

export async function updateRoleQuery(
  roleId: string,
  data: Partial<NewRoleRow>,
): Promise<RoleRow | null> {
  const [row] = await db
    .update(roles)
    .set(data)
    .where(eq(roles.id, roleId))
    .returning();
  return row ?? null;
}

export async function deleteRoleQuery(roleId: string): Promise<boolean> {
  const result = await db
    .delete(roles)
    .where(eq(roles.id, roleId))
    .returning({ id: roles.id });
  return result.length > 0;
}
