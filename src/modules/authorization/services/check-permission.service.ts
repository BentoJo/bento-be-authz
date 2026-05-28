import { Injectable } from '@nestjs/common';
import {
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { getPermissionsForRole, getRoleById } from '../../../shared/func';
import { RedisService } from '../../redis/redis.service';
import {
  validateEnum,
  validateRequired,
  validateStringLength,
  validateUUID,
} from '../../../shared/validations';
import { RoleScopeTypes } from '../../../shared/types/types';

const ROLE_TTL_SECONDS = 3600;

@Injectable()
export class CheckPermissionService {
  constructor(private readonly redisService: RedisService) {}

  async checkPermission(
    data: CheckPermissionRequest,
  ): Promise<CheckPermissionResponse> {
    const { roleId, permission } = data;

    this.validateInput(data);

    const existingRole = await getRoleById(roleId);

    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const cacheKey = `authz:role_permissions:${roleId}`;

    const cachedPermissions = await this.redisService.get(cacheKey);

    let permissions: string[];

    if (cachedPermissions) {
      permissions = JSON.parse(cachedPermissions) as string[];
    } else {
      permissions = await getPermissionsForRole(roleId);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(permissions),
        ROLE_TTL_SECONDS,
      );
    }

    return {
      allowed: permissions.includes(permission),
    };
  }

  private validateInput(data: CheckPermissionRequest): void {
    const {
      userId,
      roleId,
      permission,
      scopeType,
      scopeId,
      resourceType,
      resourceId,
    } = data;

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

    const permissionResult = validateRequired(permission, 'Permission');
    if (!permissionResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: permissionResult.message,
      });
    }

    const permissionValidation = validateStringLength(
      permission,
      1,
      255,
      'Permission',
    );
    if (!permissionValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: permissionValidation.message,
      });
    }

    if (typeof userId === 'string' && userId.trim() !== '') {
      const userIdValidation = validateUUID(userId, 'User ID');
      if (!userIdValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: userIdValidation.message,
        });
      }
    }

    if (typeof scopeType === 'string' && scopeType.trim() !== '') {
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
    }

    if (typeof scopeId === 'string' && scopeId.trim() !== '') {
      const scopeIdValidation = validateUUID(scopeId, 'Scope ID');
      if (!scopeIdValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: scopeIdValidation.message,
        });
      }
    }

    if (typeof resourceType === 'string' && resourceType.trim() !== '') {
      const resourceTypeValidation = validateStringLength(
        resourceType,
        1,
        100,
        'Resource Type',
      );
      if (!resourceTypeValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: resourceTypeValidation.message,
        });
      }
    }

    if (typeof resourceId === 'string' && resourceId.trim() !== '') {
      const resourceIdValidation = validateUUID(resourceId, 'Resource ID');
      if (!resourceIdValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: resourceIdValidation.message,
        });
      }
    }
  }
}
