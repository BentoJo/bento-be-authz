import { Injectable } from '@nestjs/common';
import {
  GetRolePermissionsRequest,
  GetRolePermissionsResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { getPermissionsForRole, getRoleById } from '../../../shared/func';
import { validateRequired, validateUUID } from '../../../shared/validations';

@Injectable()
export class GetPermissionService {
  async getRolePermissions(
    data: GetRolePermissionsRequest,
  ): Promise<GetRolePermissionsResponse> {
    const { roleId } = data;

    this.validateInput(roleId);

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

  private validateInput(roleId: string): void {
    const roleIdResult = validateRequired(roleId, 'Role ID');
    if (!roleIdResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: roleIdResult.message,
      });
    }

    const roleIdValidation = validateUUID(roleId, 'Role ID');
    if (!roleIdValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: roleIdValidation.message,
      });
    }
  }
}
