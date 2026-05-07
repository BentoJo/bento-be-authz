export type RoleScopeType =
  | 'workspace'
  | 'organization'
  | 'project'
  | 'inventory';

export const RoleScopeTypes: RoleScopeType[] = [
  'workspace',
  'organization',
  'project',
  'inventory',
];

export interface CreateRoleRequest {
  name: string;
  scopeType: RoleScopeType;
  scopeId: string;
  isSystem: boolean;
  createdBy: string;
}

export interface CreateRoleResponse {
  roleId: string;
}

export interface UpdateRoleRequest {
  roleId: string;
  name?: string;
  isEditable?: boolean;
  isDeletable?: boolean;
}

export interface UpdateRoleResponse {
  success: boolean;
}

export interface DeleteRoleRequest {
  roleId: string;
}

export interface DeleteRoleResponse {
  success: boolean;
}

export interface AssignPermissionsRequest {
  roleId: string;
  permissionIds: string[];
}

export interface AssignPermissionsResponse {
  success: boolean;
}

export interface RemovePermissionsRequest {
  roleId: string;
  permissionIds: string[];
}

export interface RemovePermissionsResponse {
  success: boolean;
}

export interface GetRolePermissionsRequest {
  roleId: string;
}

export interface GetRolePermissionsResponse {
  permissions: string[];
}

export interface ListRolesRequest {
  scopeType: RoleScopeType;
  scopeId: string;
  includeSystemRoles: boolean;
}

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  isEditable: boolean;
  isDeletable: boolean;
}

export interface ListRolesResponse {
  roles: Role[];
}

export interface CheckPermissionRequest {
  userId: string;
  roleId: string;
  permission: string;
  scopeType: string;
  scopeId: string;
  resourceType: string;
  resourceId: string;
}

export interface CheckPermissionResponse {
  allowed: boolean;
}
