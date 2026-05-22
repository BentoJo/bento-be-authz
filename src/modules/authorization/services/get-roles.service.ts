import { Injectable } from '@nestjs/common';
import {
  ListRolesRequest,
  ListRolesResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { listRolesByScope } from '../../../shared/func';
import {
  validateEnum,
  validateRequired,
  validateUUID,
} from '../../../shared/validations';
import { RoleScopeTypes } from '../../../shared/types/types';

@Injectable()
export class GetRolesService {
  async getRoles(data: ListRolesRequest): Promise<ListRolesResponse> {
    const { scopeType, scopeId, includeSystemRoles } = data;

    this.validateInput(data);

    const listRoles = await listRolesByScope(
      scopeType,
      scopeId,
      includeSystemRoles,
    );

    if (!listRoles) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to list roles',
      });
    }

    return {
      roles: listRoles,
    };
  }

  private validateInput(data: ListRolesRequest): void {
    const { scopeType, scopeId, includeSystemRoles } = data;

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

    if (
      includeSystemRoles !== undefined &&
      typeof includeSystemRoles !== 'boolean'
    ) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'includeSystemRoles must be a boolean',
      });
    }
  }
}
