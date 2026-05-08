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
import type {
  AssignPermissionsRequest,
  CheckPermissionRequest,
  CreateRoleRequest,
  DeleteRoleRequest,
  GetRolePermissionsRequest,
  ListRolesRequest,
  RemovePermissionsRequest,
  UpdateRoleRequest,
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
}
