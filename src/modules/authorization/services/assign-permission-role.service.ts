import { Injectable } from '@nestjs/common';
import {
  AssignPermissionsRequest,
  AssignPermissionsResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  assignPermissionsToRoleQuery,
  getRoleById,
  PermissionsExistsByIds,
} from '../../../shared/func';

@Injectable()
export class AssignPermissionsService {
  async assignPermissions(
    data: AssignPermissionsRequest,
  ): Promise<AssignPermissionsResponse> {
    const { roleId, permissionIds } = data;

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const allPermissionsExist = await PermissionsExistsByIds(permissionIds);
    if (!allPermissionsExist) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'One or more permissions not found',
      });
    }

    await assignPermissionsToRoleQuery(roleId, permissionIds);

    return {
      success: true,
    };
  }
}
