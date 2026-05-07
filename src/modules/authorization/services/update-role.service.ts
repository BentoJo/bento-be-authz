import { Injectable } from '@nestjs/common';
import {
  UpdateRoleRequest,
  UpdateRoleResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  getRoleById,
  roleExistsByName,
  updateRoleQuery,
} from '../../../shared/func';

@Injectable()
export class UpdateRole {
  async updateRole(data: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    const { roleId, name, isEditable, isDeletable } = data;

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    if (name && name !== existingRole.name) {
      const nameExists = await roleExistsByName(name);
      if (nameExists) {
        throw new RpcException({
          code: GrpcStatus.FAILED_PRECONDITION,
          message: 'Role with the same name already exists',
        });
      }
    }

    const updatedRole = await updateRoleQuery(roleId, {
      name,
      isEditable,
      isDeletable,
    });

    if (!updatedRole) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to update role',
      });
    }

    return {
      success: true,
    };
  }
}
