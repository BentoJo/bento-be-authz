import { Injectable } from '@nestjs/common';
import {
  RemovePermissionsRequest,
  RemovePermissionsResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  getRoleById,
  PermissionsExistsByIds,
  removePermissionsFromRole,
} from '../../../shared/func';

@Injectable()
export class RemovePermissionsService {
  async removePermissions(
    data: RemovePermissionsRequest,
  ): Promise<RemovePermissionsResponse> {
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

    await removePermissionsFromRole(roleId, permissionIds);

    return {
      success: true,
    };
  }
}
