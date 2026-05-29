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
import { RedisService } from '../../redis/redis.service';
import {
  validateName,
  validateRequired,
  validateUUID,
} from '../../../shared/validations';

@Injectable()
export class UpdateRole {
  constructor(private readonly redisService: RedisService) {}

  async updateRole(data: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    const { roleId, name, isEditable, isDeletable, scopeId } = data;

    this.validateInput(data);

    const existingRole = await getRoleById(roleId, scopeId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    if (name && name !== existingRole.name) {
      const nameExists = await roleExistsByName(
        name,
        existingRole.scopeType,
        existingRole.scopeId,
      );
      if (nameExists) {
        throw new RpcException({
          code: GrpcStatus.FAILED_PRECONDITION,
          message: 'Role with the same name already exists',
        });
      }
    }

    if (!existingRole.isEditable) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: 'Role is not editable',
      });
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

    await this.redisService.del(`authz:role_permissions:${roleId}`);

    return {
      success: true,
    };
  }

  private validateInput(data: UpdateRoleRequest): void {
    const { roleId, name, isEditable, isDeletable } = data;

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

    const hasName = name !== undefined;
    const hasIsEditable = isEditable !== undefined;
    const hasIsDeletable = isDeletable !== undefined;

    if (!hasName && !hasIsEditable && !hasIsDeletable) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'At least one field must be provided for update',
      });
    }

    if (hasName) {
      const nameResult = validateRequired(name, 'Name');
      if (!nameResult.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: nameResult.message,
        });
      }

      const nameValidation = validateName(name, 'Name');
      if (!nameValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: nameValidation.message,
        });
      }
    }

    if (hasIsEditable && typeof isEditable !== 'boolean') {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'isEditable must be a boolean',
      });
    }

    if (hasIsDeletable && typeof isDeletable !== 'boolean') {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'isDeletable must be a boolean',
      });
    }
  }
}
