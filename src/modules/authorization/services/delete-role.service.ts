import { Injectable } from '@nestjs/common';
import {
  DeleteRoleResponse,
  DeleteRoleRequest,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { deleteRoleQuery, getRoleById } from '../../../shared/func';

@Injectable()
export class DeleteRoleService {
  async deleteRole(data: DeleteRoleRequest): Promise<DeleteRoleResponse> {
    const { roleId } = data;

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const deletedRole = await deleteRoleQuery(roleId);

    if (!deletedRole) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to delete role',
      });
    }

    return {
      success: true,
    };
  }
}
