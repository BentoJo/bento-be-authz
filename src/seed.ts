import { inArray } from 'drizzle-orm';
import db from './shared/configs/db.config';

import {
  iam,
  permissions,
  rolePermissions,
  roles,
  systemRolePermissions,
  systemRoles,
} from './shared/db/schema';

/* =========================================================
   SHARED CONTRACT — paste VERBATIM (identical across all 3 seeds)
   Do NOT change ids/keys/names.
========================================================= */
import { createHash } from 'node:crypto';
export function detUuid(name: string): string {
  const h = createHash('sha1').update(`bento:${name}`).digest('hex');
  const variant = ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');
  return [h.slice(0,8), h.slice(8,12), '4'+h.slice(13,16), variant+h.slice(18,20), h.slice(20,32)].join('-');
}
const REAL_USER = { key: 'me', id: 'b2fcf3fe-8b7c-44b3-9552-e51ae0ab35dc' };
const DEMO_USER_KEYS = ['omar','lina','yousef','sara','khaled','nour'];
const USER_IDS = [REAL_USER.id, ...DEMO_USER_KEYS.map(k => detUuid(`user:${k}`))];
const SYSTEM_ROLES_ORDER = ['OWNER','ADMIN','EDITOR','VIEWER'] as const;
const WS_KEYS = ['acme','nova','orbit'];
const WS_IDS = WS_KEYS.map(k => detUuid(`ws:${k}`));
const wsRoleId = (wsId: string, role: string) => detUuid(`role:${wsId}:${role}`);
const sysRoleId = (role: string) => detUuid(`sysrole:${role}`);

/* =========================================================
   TYPES
========================================================= */

type PermissionCategory =
  | 'workspace'
  | 'security'
  | 'teams'
  | 'boards'
  | 'cards';

type PermissionSeed = {
  name: string;
  category: PermissionCategory;
  resource: string;
  action: string;
  description: string;
};

/* =========================
   1. PERMISSION DEFINITIONS
========================= */

const PERMISSION_LIST: PermissionSeed[] = [
  { name: 'workspace:roles:read', category: 'security', resource: 'roles', action: 'read', description: 'Allows viewing workspace roles and their permissions.' },
  { name: 'workspace:team:read', category: 'teams', resource: 'team', action: 'read', description: 'Allows viewing teams within the workspace.' },
  /* =========================================================
     WORKSPACE SETTINGS
  ========================================================= */

  {
    name: 'workspace:workspace:manage',
    category: 'workspace',
    resource: 'workspace',
    action: 'manage',
    description:
      'Grants full administrative control over the workspace, including updating settings, managing configuration, and controlling lifecycle operations.',
  },

  {
    name: 'workspace:workspace:transfer_ownership',
    category: 'workspace',
    resource: 'workspace',
    action: 'transfer_ownership',
    description:
      'Allows transferring ownership of the workspace to another member, changing the primary administrative authority.',
  },

  {
    name: 'workspace:workspace:archive',
    category: 'workspace',
    resource: 'workspace',
    action: 'archive',
    description:
      'Allows archiving the workspace, temporarily disabling access while preserving all data.',
  },

  {
    name: 'workspace:workspace:restore',
    category: 'workspace',
    resource: 'workspace',
    action: 'restore',
    description:
      'Allows restoring an archived workspace and reactivating access for all members.',
  },

  {
    name: 'workspace:workspace:unarchive',
    category: 'workspace',
    resource: 'workspace',
    action: 'unarchive',
    description:
      'Allows unarchiving a workspace and returning it to an active state.',
  },

  /* =========================================================
     WORKSPACE MEMBERS
  ========================================================= */

  {
    name: 'workspace:members:read',
    category: 'workspace',
    resource: 'members',
    action: 'read',
    description:
      'Allows viewing the list of workspace members, including their roles and basic membership information.',
  },

  {
    name: 'workspace:members:manage',
    category: 'workspace',
    resource: 'members',
    action: 'manage',
    description:
      'Allows managing workspace members, including inviting new users, removing members, and updating membership roles.',
  },

  /* =========================================================
     WORKSPACE INVITATIONS
  ========================================================= */

  {
    name: 'workspace:invitations:manage',
    category: 'workspace',
    resource: 'invitations',
    action: 'manage',
    description:
      'Allows creating, viewing, and revoking workspace invitations for new or existing users.',
  },

  /* =========================================================
     ROLES & PERMISSIONS
  ========================================================= */

  {
    name: 'workspace:roles:manage',
    category: 'security',
    resource: 'roles',
    action: 'manage',
    description:
      'Allows full management of roles and permissions, including creating roles, assigning permissions, and modifying access control rules.',
  },

  /* =========================================================
     TEAMS
  ========================================================= */

  {
    name: 'workspace:teams:read',
    category: 'teams',
    resource: 'teams',
    action: 'read',
    description:
      'Allows viewing all teams within the workspace and their basic information.',
  },

  {
    name: 'workspace:teams:manage',
    category: 'teams',
    resource: 'teams',
    action: 'manage',
    description:
      'Allows creating, updating, and deleting teams within the workspace.',
  },

  {
    name: 'workspace:team_members:manage',
    category: 'teams',
    resource: 'team_members',
    action: 'manage',
    description:
      'Allows adding or removing members from teams and managing team membership structure.',
  },

  /* =========================================================
     BOARDS
  ========================================================= */

  {
    name: 'workspace:boards:read',
    category: 'boards',
    resource: 'boards',
    action: 'read',
    description:
      'Allows viewing public boards and their structure, including columns and cards metadata.',
  },

  {
    name: 'workspace:boards:manage',
    category: 'boards',
    resource: 'boards',
    action: 'manage',
    description:
      'Allows full management of boards, including creation, updates, archiving, and deletion.',
  },

  {
    name: 'workspace:boards:read_private',
    category: 'boards',
    resource: 'boards',
    action: 'read_private',
    description:
      'Allows viewing private or restricted boards when explicitly granted access.',
  },

  /* =========================================================
     BOARD MEMBERS
  ========================================================= */

  {
    name: 'workspace:board_members:read',
    category: 'boards',
    resource: 'board_members',
    action: 'read',
    description:
      'Allows viewing members assigned to a specific board and their roles.',
  },

  {
    name: 'workspace:board_members:manage',
    category: 'boards',
    resource: 'board_members',
    action: 'manage',
    description:
      'Allows adding or removing members from boards and managing board-level access control.',
  },

  /* =========================================================
     COLUMNS
  ========================================================= */

  {
    name: 'workspace:columns:read',
    category: 'boards',
    resource: 'columns',
    action: 'read',
    description:
      'Allows viewing board columns and their structure within a board.',
  },

  {
    name: 'workspace:columns:manage',
    category: 'boards',
    resource: 'columns',
    action: 'manage',
    description:
      'Allows creating, updating, reordering, and deleting board columns.',
  },

  /* =========================================================
     CARDS
  ========================================================= */

  {
    name: 'workspace:cards:read',
    category: 'cards',
    resource: 'cards',
    action: 'read',
    description:
      'Allows viewing cards within boards, including their content, status, and metadata.',
  },

  {
    name: 'workspace:cards:manage',
    category: 'cards',
    resource: 'cards',
    action: 'manage',
    description:
      'Allows full lifecycle management of cards including creation, updates, archiving, and deletion.',
  },

  {
    name: 'workspace:cards:read_hidden',
    category: 'cards',
    resource: 'cards',
    action: 'read_hidden',
    description:
      'Allows viewing hidden or restricted cards that are not visible to standard members.',
  },

  /* =========================================================
     CARD ASSIGNEES
  ========================================================= */

  {
    name: 'workspace:card_assignees:read',
    category: 'cards',
    resource: 'card_assignees',
    action: 'read',
    description: 'Allows viewing which users are assigned to specific cards.',
  },

  {
    name: 'workspace:card_assignees:manage',
    category: 'cards',
    resource: 'card_assignees',
    action: 'manage',
    description:
      'Allows assigning or removing users from cards and managing task ownership.',
  },

  /* =========================================================
     LABELS
  ========================================================= */

  {
    name: 'workspace:labels:read',
    category: 'cards',
    resource: 'labels',
    action: 'read',
    description:
      'Allows viewing labels used for categorizing and organizing cards.',
  },

  {
    name: 'workspace:labels:manage',
    category: 'cards',
    resource: 'labels',
    action: 'manage',
    description:
      'Allows creating, updating, and deleting labels used for organizing cards.',
  },

  /* =========================================================
     PRIORITY & DATES
  ========================================================= */

  {
    name: 'workspace:card_priority:manage',
    category: 'cards',
    resource: 'card_priority',
    action: 'manage',
    description:
      'Allows setting and updating card priority levels to define task importance.',
  },

  {
    name: 'workspace:card_dates:manage',
    category: 'cards',
    resource: 'card_dates',
    action: 'manage',
    description:
      'Allows setting, updating, and clearing due dates for cards to manage deadlines.',
  },

  /* =========================================================
     COMMENTS
  ========================================================= */

  {
    name: 'workspace:comments:read',
    category: 'cards',
    resource: 'comments',
    action: 'read',
    description:
      'Allows viewing comments on cards for collaboration and discussion tracking.',
  },

  {
    name: 'workspace:comments:manage',
    category: 'cards',
    resource: 'comments',
    action: 'manage',
    description:
      'Allows creating, editing, and deleting comments on cards for collaboration.',
  },

  /* =========================================================
     ATTACHMENTS
  ========================================================= */

  {
    name: 'workspace:attachments:read',
    category: 'cards',
    resource: 'attachments',
    action: 'read',
    description: 'Allows viewing files and attachments uploaded to cards.',
  },

  {
    name: 'workspace:attachments:manage',
    category: 'cards',
    resource: 'attachments',
    action: 'manage',
    description: 'Allows uploading and removing file attachments on cards.',
  },
];

/* =========================
   2. SYSTEM ROLES
========================= */

const SYSTEM_ROLES = [
  {
    name: 'OWNER',
    description: 'Full control over all workspace resources',
  },
  {
    name: 'ADMIN',
    description: 'Administrative control excluding ownership transfer',
  },
  {
    name: 'EDITOR',
    description:
      'Can create and manage content but not manage workspace settings',
  },
  {
    name: 'VIEWER',
    description: 'Read-only access to workspace resources',
  },
];

/* =========================
   3. ROLE PERMISSION MAP
========================= */

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  OWNER: PERMISSION_LIST.map((p) => p.name),

  ADMIN: PERMISSION_LIST.filter(
    (p) => p.name !== 'workspace:workspace:transfer_ownership',
  ).map((p) => p.name),

  EDITOR: [
    'workspace:roles:read',
    'workspace:team:read',
    'workspace:teams:read',
    'workspace:teams:manage',
    'workspace:boards:read',
    'workspace:boards:manage',
    'workspace:board_members:read',
    'workspace:board_members:manage',
    'workspace:columns:read',
    'workspace:columns:manage',
    'workspace:cards:read',
    'workspace:cards:manage',
    'workspace:cards:read_hidden',
    'workspace:card_assignees:read',
    'workspace:card_assignees:manage',
    'workspace:labels:read',
    'workspace:labels:manage',
    'workspace:card_priority:manage',
    'workspace:card_dates:manage',
    'workspace:comments:read',
    'workspace:comments:manage',
    'workspace:attachments:read',
    'workspace:attachments:manage',
  ],

  VIEWER: [
    'workspace:roles:read',
    'workspace:team:read',
    'workspace:members:read',
    'workspace:teams:read',
    'workspace:boards:read',
    'workspace:board_members:read',
    'workspace:columns:read',
    'workspace:cards:read',
    'workspace:card_assignees:read',
    'workspace:labels:read',
    'workspace:comments:read',
    'workspace:attachments:read',
  ],
};

/* =========================================================
   4. SEED STEPS
========================================================= */

/**
 * Step 1: permissions — insert PERMISSION_LIST and return name -> id map.
 */
async function seedPermissions(): Promise<Map<string, string>> {
  await db.insert(permissions).values(PERMISSION_LIST).onConflictDoNothing();

  const inserted = await db
    .select({ id: permissions.id, name: permissions.name })
    .from(permissions)
    .where(
      inArray(
        permissions.name,
        PERMISSION_LIST.map((p) => p.name),
      ),
    );

  return new Map(inserted.map((p) => [p.name, p.id]));
}

/**
 * Step 2: systemRoles — insert OWNER/ADMIN/EDITOR/VIEWER with DETERMINISTIC
 * ids = sysRoleId(name) so they're stable across seeds.
 */
async function seedSystemRoles(): Promise<number> {
  const rows = SYSTEM_ROLES.map((r) => ({
    id: sysRoleId(r.name),
    name: r.name,
    isSystem: true,
  }));

  await db.insert(systemRoles).values(rows).onConflictDoNothing();
  return rows.length;
}

/**
 * Step 3: systemRolePermissions — map each system role to its permissions
 * using ROLE_PERMISSION_MAP (resolving permission ids by name).
 */
async function seedSystemRolePermissions(
  permissionNameToId: Map<string, string>,
): Promise<number> {
  const data: { systemRoleId: string; permissionId: string }[] = [];

  for (const [roleName, permissionNames] of Object.entries(
    ROLE_PERMISSION_MAP,
  )) {
    const systemRoleId = sysRoleId(roleName);

    for (const permissionName of permissionNames) {
      const permissionId = permissionNameToId.get(permissionName);
      if (!permissionId) continue;

      data.push({ systemRoleId, permissionId });
    }
  }

  if (data.length > 0) {
    await db
      .insert(systemRolePermissions)
      .values(data)
      .onConflictDoNothing();
  }

  return data.length;
}

/**
 * Step 4: iam mirror table — insert one row per USER_IDS.
 */
async function seedIam(): Promise<number> {
  const rows = USER_IDS.map((userId) => ({ userId }));
  await db.insert(iam).values(rows).onConflictDoNothing();
  return rows.length;
}

/**
 * Step 5: roles — for EACH workspace id, create one per-workspace role per
 * system role name, with DETERMINISTIC id = wsRoleId(wsId, role) so ws's
 * workspace_members.authzRoleId matches.
 */
async function seedWorkspaceRoles(): Promise<number> {
  const rows: {
    id: string;
    scopeType: 'workspace';
    scopeId: string;
    systemRoleId: string;
    name: string;
    isSystem: boolean;
    isDeletable: boolean;
    isEditable: boolean;
    createdBy: string;
  }[] = [];

  for (const wsId of WS_IDS) {
    for (const role of SYSTEM_ROLES_ORDER) {
      rows.push({
        id: wsRoleId(wsId, role),
        scopeType: 'workspace',
        scopeId: wsId,
        systemRoleId: sysRoleId(role),
        name: role,
        isSystem: true,
        isDeletable: false,
        isEditable: false,
        createdBy: REAL_USER.id,
      });
    }
  }

  await db.insert(roles).values(rows).onConflictDoNothing();
  return rows.length;
}

/**
 * Step 6: rolePermissions — for each per-workspace role, attach the SAME
 * permissions its system role has (reuse ROLE_PERMISSION_MAP -> permission ids).
 */
async function seedWorkspaceRolePermissions(
  permissionNameToId: Map<string, string>,
): Promise<number> {
  const data: { roleId: string; permissionId: string }[] = [];

  for (const wsId of WS_IDS) {
    for (const role of SYSTEM_ROLES_ORDER) {
      const roleId = wsRoleId(wsId, role);
      const permissionNames = ROLE_PERMISSION_MAP[role] ?? [];

      for (const permissionName of permissionNames) {
        const permissionId = permissionNameToId.get(permissionName);
        if (!permissionId) continue;

        data.push({ roleId, permissionId });
      }
    }
  }

  if (data.length > 0) {
    await db.insert(rolePermissions).values(data).onConflictDoNothing();
  }

  return data.length;
}

/* =========================================================
   5. MAIN
========================================================= */

async function main(): Promise<void> {
  console.log('🌱 Seeding AuthZ (shared-contract aligned)...');

  const permissionNameToId = await seedPermissions();
  const systemRoleCount = await seedSystemRoles();
  const systemRolePermissionCount =
    await seedSystemRolePermissions(permissionNameToId);
  const iamCount = await seedIam();
  const workspaceRoleCount = await seedWorkspaceRoles();
  const workspaceRolePermissionCount =
    await seedWorkspaceRolePermissions(permissionNameToId);

  console.log('✅ AuthZ seeded successfully');
  console.log('   permissions:              ', permissionNameToId.size);
  console.log('   system_roles:             ', systemRoleCount);
  console.log('   system_role_permissions:  ', systemRolePermissionCount);
  console.log('   iam:                      ', iamCount);
  console.log('   roles (per-workspace):    ', workspaceRoleCount);
  console.log('   role_permissions:         ', workspaceRolePermissionCount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ AuthZ seed failed');
    console.error(error);
    process.exit(1);
  });
