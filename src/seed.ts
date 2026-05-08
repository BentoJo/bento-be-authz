import db from '../src/shared/configs/db.config'; // adjust path
import {
  iam,
  permissions,
  rolePermissions,
  roles,
} from '../src/shared/db/schema'; // adjust path

async function seed() {
  console.log('🌱 Seeding database...');

  /**
   * Fake Users
   */
  const users = [
    {
      userId: '11111111-1111-1111-1111-111111111111',
    },
    {
      userId: '22222222-2222-2222-2222-222222222222',
    },
  ];

  await db.insert(iam).values(users).onConflictDoNothing();

  /**
   * Permissions
   */
  const insertedPermissions = await db
    .insert(permissions)
    .values([
      { name: 'users.read' },
      { name: 'users.create' },
      { name: 'users.update' },
      { name: 'users.delete' },

      { name: 'roles.read' },
      { name: 'roles.create' },
      { name: 'roles.update' },
      { name: 'roles.delete' },

      { name: 'inventory.read' },
      { name: 'inventory.create' },
      { name: 'inventory.update' },
      { name: 'inventory.delete' },
    ])
    .returning();

  /**
   * Roles
   */
  const insertedRoles = await db
    .insert(roles)
    .values([
      {
        name: 'Organization Owner',
        scopeType: 'organization',
        scopeId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        isSystem: true,
        isEditable: false,
        isDeletable: false,
        createdBy: users[0].userId,
      },

      {
        name: 'Organization Admin',
        scopeType: 'organization',
        scopeId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        isSystem: true,
        isEditable: false,
        isDeletable: false,
        createdBy: users[0].userId,
      },

      {
        name: 'Project Manager',
        scopeType: 'project',
        scopeId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        isSystem: false,
        createdBy: users[0].userId,
      },

      {
        name: 'Inventory Manager',
        scopeType: 'inventory',
        scopeId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        isSystem: false,
        createdBy: users[1].userId,
      },
    ])
    .returning();

  /**
   * Role-Permission Mapping
   */

  const ownerRole = insertedRoles.find((r) => r.name === 'Organization Owner');

  const adminRole = insertedRoles.find((r) => r.name === 'Organization Admin');

  const projectManagerRole = insertedRoles.find(
    (r) => r.name === 'Project Manager',
  );

  const inventoryManagerRole = insertedRoles.find(
    (r) => r.name === 'Inventory Manager',
  );

  if (
    !ownerRole ||
    !adminRole ||
    !projectManagerRole ||
    !inventoryManagerRole
  ) {
    throw new Error('Roles not found after insertion');
  }

  const rolePermissionValues: Array<{ roleId: string; permissionId: string }> =
    [];

  /**
   * Owner => all permissions
   */
  for (const permission of insertedPermissions) {
    rolePermissionValues.push({
      roleId: ownerRole.id,
      permissionId: permission.id,
    });
  }

  /**
   * Admin => limited permissions
   */
  for (const permission of insertedPermissions.filter(
    (p) => p.name !== 'users.delete' && p.name !== 'roles.delete',
  )) {
    rolePermissionValues.push({
      roleId: adminRole.id,
      permissionId: permission.id,
    });
  }

  /**
   * Project Manager
   */
  for (const permission of insertedPermissions.filter(
    (p) => p.name.startsWith('users.') || p.name.startsWith('roles.read'),
  )) {
    rolePermissionValues.push({
      roleId: projectManagerRole.id,
      permissionId: permission.id,
    });
  }

  /**
   * Inventory Manager
   */
  for (const permission of insertedPermissions.filter((p) =>
    p.name.startsWith('inventory.'),
  )) {
    rolePermissionValues.push({
      roleId: inventoryManagerRole.id,
      permissionId: permission.id,
    });
  }

  await db.insert(rolePermissions).values(rolePermissionValues);

  console.log('✅ Database seeded successfully');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed');
    console.error(err);
    process.exit(1);
  });
