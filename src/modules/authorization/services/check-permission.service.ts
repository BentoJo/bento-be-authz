import { Injectable } from '@nestjs/common';
import {
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  getPermissionsForRole,
  getPermissionsForSystemRole,
  getRoleById,
} from '../../../shared/func';
import { RedisService } from '../../redis/redis.service';
import {
  validateRequired,
  validateStringLength,
  validateUUID,
} from '../../../shared/validations';

const ROLE_TTL_SECONDS = 3600;

@Injectable()
export class CheckPermissionService {
  constructor(private readonly redisService: RedisService) {}

  async checkPermission(
    data: CheckPermissionRequest,
  ): Promise<CheckPermissionResponse> {
    const { roleId, permission } = data;

    this.validateInput(data);

    const existingRole = await getRoleById(roleId, data.scopeId);

    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    let cacheKey: string;

    let permissions: string[];

    if (existingRole.isSystem) {
      /**
       * System role permissions cache
       * Shared across all scoped roles using same systemRoleId
       */
      cacheKey = `authz:system_role_permissions:${existingRole.systemRoleId}`;

      const cachedPermissions = await this.redisService.get(cacheKey);

      if (cachedPermissions) {
        permissions = JSON.parse(cachedPermissions) as string[];
      } else {
        permissions = await getPermissionsForSystemRole(
          existingRole.systemRoleId!,
        );

        await this.redisService.set(
          cacheKey,
          JSON.stringify(permissions),
          ROLE_TTL_SECONDS,
        );
      }
    } else {
      /**
       * Custom role permissions cache
       */
      cacheKey = `authz:role_permissions:${roleId}`;

      const cachedPermissions = await this.redisService.get(cacheKey);

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
    }

    return {
      allowed: permissions.includes(permission),
    };
  }

  private validateInput(data: CheckPermissionRequest): void {
    const { permission, scopeId, roleId } = data;

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
  }
}
