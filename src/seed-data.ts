import { createHash } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import db from './shared/configs/db.config';
import {
  iam,
  roles,
  rolePermissions,
  systemRoles,
  systemRolePermissions,
} from './shared/db/schema';

/* =====================================================================
   DETERMINISTIC IDS — identical algorithm + names as the iam / ws seeds
   so cross-service references (userId, workspaceId, authzRoleId) match.
===================================================================== */

function detUuid(name: string): string {
  const h = createHash('sha1').update(`bento:${name}`).digest('hex');
  const variant = ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80)
    .toString(16)
    .padStart(2, '0');
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '5' + h.slice(13, 16),
    variant + h.slice(18, 20),
    h.slice(20, 32),
  ].join('-');
}

const userId = (i: number) => detUuid(`user:${i}`);
const workspaceId = (w: number) => detUuid(`workspace:${w}`);
const authzRoleId = (w: number, role: string) =>
  detUuid(`authzrole:${w}:${role}`);

/* =====================================================================
   TOPOLOGY (replicated in iam + ws seeds)
===================================================================== */

const USER_COUNT = 25;
const ROLE_NAMES = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'] as const;

const WORKSPACES = [
  { idx: 0, owner: 1 },
  { idx: 1, owner: 9 },
  { idx: 2, owner: 17 },
];

/* =====================================================================
   SEED
   Run AFTER `npm run seed` (which loads permissions + system roles).
===================================================================== */

async function seedAuthZData() {
  console.log('🌱 Seeding AuthZ data (iam mirror + workspace roles)...');

  /* ---- iam mirror rows ---- */
  const iamRows = Array.from({ length: USER_COUNT }, (_, idx) => ({
    userId: userId(idx + 1),
  }));
  await db.insert(iam).values(iamRows).onConflictDoNothing();

  /* ---- lookup system roles + their permission sets ---- */
  const sysRoles = await db
    .select({ id: systemRoles.id, name: systemRoles.name })
    .from(systemRoles)
    .where(inArray(systemRoles.name, ROLE_NAMES as unknown as string[]));

  if (sysRoles.length === 0) {
    throw new Error(
      'No system roles found. Run `npm run seed` before `npm run seed:data`.',
    );
  }

  const sysRoleByName = new Map(sysRoles.map((r) => [r.name, r.id]));

  // permissionId list for each system role
  const sysRolePerms = await db
    .select({
      systemRoleId: systemRolePermissions.systemRoleId,
      permissionId: systemRolePermissions.permissionId,
    })
    .from(systemRolePermissions);

  const permsBySysRole = new Map<string, string[]>();
  for (const rp of sysRolePerms) {
    const arr = permsBySysRole.get(rp.systemRoleId) ?? [];
    arr.push(rp.permissionId);
    permsBySysRole.set(rp.systemRoleId, arr);
  }

  /* ---- per-workspace roles + role permissions ---- */
  const roleRows: (typeof roles.$inferInsert)[] = [];
  const rolePermRows: (typeof rolePermissions.$inferInsert)[] = [];

  for (const ws of WORKSPACES) {
    for (const roleName of ROLE_NAMES) {
      const systemRoleId = sysRoleByName.get(roleName)!;
      const id = authzRoleId(ws.idx, roleName);

      roleRows.push({
        id,
        scopeType: 'workspace',
        scopeId: workspaceId(ws.idx),
        systemRoleId,
        name: roleName,
        isSystem: true,
        isDeletable: false,
        isEditable: false,
        createdBy: userId(ws.owner),
      });

      for (const permissionId of permsBySysRole.get(systemRoleId) ?? []) {
        rolePermRows.push({ roleId: id, permissionId });
      }
    }
  }

  await db.insert(roles).values(roleRows).onConflictDoNothing();
  // role_permissions composite PK -> skip dupes
  for (let i = 0; i < rolePermRows.length; i += 500) {
    await db
      .insert(rolePermissions)
      .values(rolePermRows.slice(i, i + 500))
      .onConflictDoNothing();
  }

  console.log(
    `✅ AuthZ data seeded: ${iamRows.length} iam rows, ${roleRows.length} workspace roles, ${rolePermRows.length} role-permission links`,
  );
}

void seedAuthZData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ AuthZ data seed failed');
    console.error(error);
    process.exit(1);
  });
