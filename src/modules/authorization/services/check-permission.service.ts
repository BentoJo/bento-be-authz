import { Injectable } from '@nestjs/common';
import {
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { getPermissionsForRole, getRoleById } from '../../../shared/func';

@Injectable()
export class CheckPermissionService {
  async checkPermission(
    data: CheckPermissionRequest,
  ): Promise<CheckPermissionResponse> {
    const { roleId, permission } = data;

    if (!roleId) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'roleId is required',
      });
    }

    if (!permission) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'permission is required',
      });
    }

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const permissions = await getPermissionsForRole(roleId);
    const allowed = permissions.includes(permission);

    return { allowed };
  }
}
