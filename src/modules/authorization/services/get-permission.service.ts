import { Injectable } from '@nestjs/common';
import {
  GetRolePermissionsRequest,
  GetRolePermissionsResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { getPermissionsForRole, getRoleById } from '../../../shared/func';

@Injectable()
export class GetPermissionService {
  async getRolePermissions(
    data: GetRolePermissionsRequest,
  ): Promise<GetRolePermissionsResponse> {
    const { roleId } = data;

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }
    const permissions = await getPermissionsForRole(roleId);

    return {
      permissions,
    };
  }
}
