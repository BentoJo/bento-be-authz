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
@Controller()
export class AuthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly createRoleService: CreateRole,
    private readonly getRolesService: GetRolesService,
    private readonly updateRoleService: UpdateRole,
    private readonly deleteRoleService: DeleteRoleService,
    private readonly assignPermissionRoleService: AssignPermissionsService,
    private readonly getPermissionService: GetPermissionService,
    private readonly removePermissionRoleService: RemovePermissionsService,
  ) {}

  @GrpcMethod('AuthorizationService', 'HealthCheck')
  healthCheck() {
    return { status: this.healthService.healthCheck() };
  }
}
