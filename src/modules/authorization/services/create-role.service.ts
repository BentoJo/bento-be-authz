import { Injectable } from '@nestjs/common';
import {
  CreateRoleRequest,
  CreateRoleResponse,
} from '../../../shared/types/types';
import { createRoleQuery, roleExistsByName } from '../../../shared/func/roles';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { upsertIamUser } from '../../../shared/func';

@Injectable()
export class CreateRole {
  async createRole(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    const { name, scopeType, scopeId, isSystem, createdBy } = data;
    const existingRole = await roleExistsByName(name);
    // Check if a role with the same name already exists
    if (existingRole) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: 'Role with the same name already exists',
      });
    }

    // Ensure the creator exists in the IAM system
    await upsertIamUser({ userId: createdBy });

    // Create the new role
    const newRole = await createRoleQuery({
      name,
      scopeType,
      scopeId,
      isSystem,
      createdBy,
    });

    if (!newRole) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to create role',
      });
    }

    return {
      roleId: newRole.id,
    };
  }
}
