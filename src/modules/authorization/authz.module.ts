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
import { GetUserRolesService } from './services/get-roles-by-ids.service';
import { ListPermissionsService } from './services/list-permissions.service';
import { SearchRolesService } from './services/search-roles.service';
import { BatchCheckPermissionsService } from './services/batch-check-permissions.service';
import { CreateSystemRoleService } from './services/create-system-roles.service';
import { RedisModule } from '../redis/redis.module';
import { GetSystemRolesService } from './services/get-system-roles.service';

@Module({
  imports: [RedisModule],
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
    GetUserRolesService,
    ListPermissionsService,
    SearchRolesService,
    BatchCheckPermissionsService,
    CreateSystemRoleService,
    GetSystemRolesService,
  ],
})
export class AuthModule {}
