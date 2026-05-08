import { Module } from '@nestjs/common';
import { AuthController } from './authz.controller';
import { CreateRole } from './services/create-role.service';
import { HealthService } from './services/health.service';
import { CheckPermissionService } from './services/check-permission.service';
import { GetRolesService } from './services/get-roles.service';
import { UpdateRole } from './services/update-role.service';
import { DeleteRoleService } from './services/delete-role.service';
import { AssignPermissionsService } from './services/assign-permission-role.service';
import { GetPermissionService } from './services/get-permission.service';
import { RemovePermissionsService } from './services/remove-permission-role.service';

@Module({
  controllers: [AuthController],
  providers: [
    HealthService,
    GetRolesService,
    CheckPermissionService,
    CreateRole,
    UpdateRole,
    DeleteRoleService,
    AssignPermissionsService,
    RemovePermissionsService,
    GetPermissionService,
  ],
})
export class AuthModule {}
