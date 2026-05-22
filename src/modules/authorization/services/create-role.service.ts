import { Injectable } from '@nestjs/common';
import {
  CreateRoleRequest,
  CreateRoleResponse,
} from '../../../shared/types/types';
import { createRoleQuery, roleExistsByName } from '../../../shared/func/roles';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { upsertIamUser } from '../../../shared/func';
import {
  validateEnum,
  validateName,
  validateRequired,
  validateUUID,
} from '../../../shared/validations';
import { RoleScopeTypes } from '../../../shared/types/types';

@Injectable()
export class CreateRole {
  async createRole(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    const { name, scopeType, scopeId, isSystem, createdBy } = data;

    this.validateInput(data);

    const existingRole = await roleExistsByName(name);
    // Check if a role with the same name already exists
    if (existingRole) {
      throw new RpcException({
        code: GrpcStatus.ALREADY_EXISTS,
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

  private validateInput(data: CreateRoleRequest): void {
    const { name, scopeType, scopeId, isSystem, createdBy } = data;

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

    const scopeTypeResult = validateRequired(scopeType, 'Scope Type');
    if (!scopeTypeResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeTypeResult.message,
      });
    }

    const scopeTypeValidation = validateEnum(
      scopeType,
      RoleScopeTypes,
      'Scope Type',
    );
    if (!scopeTypeValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeTypeValidation.message,
      });
    }

    const scopeIdResult = validateRequired(scopeId, 'Scope ID');
    if (!scopeIdResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeIdResult.message,
      });
    }

    const scopeIdValidation = validateUUID(scopeId, 'Scope ID');
    if (!scopeIdValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeIdValidation.message,
      });
    }

    if (typeof isSystem !== 'boolean') {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'isSystem must be a boolean',
      });
    }

    const createdByResult = validateRequired(createdBy, 'Created By');
    if (!createdByResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: createdByResult.message,
      });
    }

    const createdByValidation = validateUUID(createdBy, 'Created By');
    if (!createdByValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: createdByValidation.message,
      });
    }
  }
}
