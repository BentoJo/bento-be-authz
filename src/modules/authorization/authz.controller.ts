import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateRole } from './services/create-role.service';
import { HealthService } from './services/health.service';
import { DeleteRoleService } from './services/delete-role.service';
import { RemovePermissionsService } from './services/remove-permission-role.service';
import { GetRolesService } from './services/get-roles.service';
import { UpdateRole } from './services/update-role.service';
import { GetPermissionService } from './services/get-permission.service';
import { AssignPermissionsService } from './services/assign-permission-role.service';
import { CheckPermissionService } from './services/check-permission.service';
import { GetUserRolesService } from './services/get-roles-by-ids.service';
import { ListPermissionsService } from './services/list-permissions.service';
import { SearchRolesService } from './services/search-roles.service';
import { BatchCheckPermissionsService } from './services/batch-check-permissions.service';
import { CreateSystemRoleService } from './services/create-system-roles.service';
import type {
  AssignPermissionsRequest,
  CheckPermissionRequest,
  CreateRoleRequest,
  DeleteRoleRequest,
  GetRolePermissionsRequest,
  ListRolesRequest,
  RemovePermissionsRequest,
  UpdateRoleRequest,
  GetUserRolesRequest,
  SearchRolesRequest,
  BatchCheckPermissionsRequest,
  CreateSystemRolesRequest,
} from '../../shared/types/types';
@Controller()
export class AuthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly createRoleService: CreateRole,
    private readonly getRolesService: GetRolesService, // ListRolesService,
    private readonly updateRoleService: UpdateRole,
    private readonly deleteRoleService: DeleteRoleService,
    private readonly assignPermissionRoleService: AssignPermissionsService,
    private readonly getPermissionService: GetPermissionService,
    private readonly removePermissionRoleService: RemovePermissionsService,
    private readonly checkPermissionService: CheckPermissionService,
    private readonly getUserRolesService: GetUserRolesService,
    private readonly listPermissionsService: ListPermissionsService,
    private readonly searchRolesService: SearchRolesService,
    private readonly batchCheckPermissionsService: BatchCheckPermissionsService,
    private readonly createSystemRoleService: CreateSystemRoleService,
  ) {}

  /*
    HealthCheck
    ListRoles
    CheckPermission
    CreateRole
    UpdateRole
    DeleteRole
    AssignPermissionsToRole
    RemovePermissionsFromRole
    GetRolePermissions
  */

  @GrpcMethod('AuthorizationService', 'HealthCheck')
  healthCheck() {
    return { status: this.healthService.healthCheck() };
  }

  @GrpcMethod('AuthorizationService', 'ListRoles')
  listRoles(data: ListRolesRequest) {
    return this.getRolesService.getRoles(data);
  }

  @GrpcMethod('AuthorizationService', 'CheckPermission')
  checkPermission(data: CheckPermissionRequest) {
    return this.checkPermissionService.checkPermission(data);
  }

  @GrpcMethod('AuthorizationService', 'CreateRole')
  createRole(data: CreateRoleRequest) {
    return this.createRoleService.createRole(data);
  }

  @GrpcMethod('AuthorizationService', 'UpdateRole')
  updateRole(data: UpdateRoleRequest) {
    return this.updateRoleService.updateRole(data);
  }

  @GrpcMethod('AuthorizationService', 'DeleteRole')
  deleteRole(data: DeleteRoleRequest) {
    return this.deleteRoleService.deleteRole(data);
  }

  @GrpcMethod('AuthorizationService', 'AssignPermissionsToRole')
  assignPermissions(data: AssignPermissionsRequest) {
    return this.assignPermissionRoleService.assignPermissions(data);
  }

  @GrpcMethod('AuthorizationService', 'RemovePermissionsFromRole')
  removePermissions(data: RemovePermissionsRequest) {
    return this.removePermissionRoleService.removePermissions(data);
  }

  @GrpcMethod('AuthorizationService', 'GetRolePermissions')
  getPermissions(data: GetRolePermissionsRequest) {
    return this.getPermissionService.getRolePermissions(data);
  }

  @GrpcMethod('AuthorizationService', 'GetRolesByIds')
  getUserRoles(data: GetUserRolesRequest) {
    return this.getUserRolesService.getUserRoles(data);
  }

  @GrpcMethod('AuthorizationService', 'ListPermissions')
  listPermissions() {
    return this.listPermissionsService.listPermissions();
  }

  @GrpcMethod('AuthorizationService', 'SearchRoles')
  searchRoles(data: SearchRolesRequest) {
    return this.searchRolesService.searchRoles(data);
  }

  @GrpcMethod('AuthorizationService', 'BatchCheckPermissions')
  batchCheckPermissions(data: BatchCheckPermissionsRequest) {
    return this.batchCheckPermissionsService.batchCheckPermissions(data);
  }

  @GrpcMethod('AuthorizationService', 'CreateSystemRoles')
  createSystemRoles(data: CreateSystemRolesRequest) {
    return this.createSystemRoleService.createSystemRole(data);
  }
}
