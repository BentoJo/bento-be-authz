import { Injectable } from '@nestjs/common';
import {
  AssignPermissionsRequest,
  AssignPermissionsResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  assignPermissionsToRoleQuery,
  getRoleById,
  PermissionsExistsByIds,
} from '../../../shared/func';
import db, { transaction } from '../../../shared/configs/db.config';
import { RedisService } from '../../redis/redis.service';
import { validateRequired, validateUUID } from '../../../shared/validations';

@Injectable()
export class AssignPermissionsService {
  constructor(private readonly redisService: RedisService) {}

  async assignPermissions(
    data: AssignPermissionsRequest,
  ): Promise<AssignPermissionsResponse> {
    const { roleId, permissionIds } = data;

    this.validateInput(data);

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const allPermissionsExist = await PermissionsExistsByIds(permissionIds);
    if (!allPermissionsExist) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'One or more permissions not found',
      });
    }

    // Run assignment and outbox insert in a transaction
    await transaction(async (tx) => {
      await assignPermissionsToRoleQuery(
        roleId,
        permissionIds,
        tx as typeof db,
      );

      // Insert outbox event for background delivery
      // const event = {
      //   eventId: `evt-${Date.now()}-${roleId}`,
      //   eventType: 'permissions.assigned',
      //   scopeType: existingRole.scopeType,
      //   scopeId: existingRole.scopeId,
      //   payload: {
      //     roleId,
      //     permissionIds,
      //   },
      //   createdAt: new Date(),
      // };

      // await insertOutboxEvent(event, tx as typeof db);
    });

    // invalidate role permissions cache
    await this.redisService.del(`authz:role_permissions:${roleId}`);

    return {
      success: true,
    };
  }

  private validateInput(data: AssignPermissionsRequest): void {
    const { roleId, permissionIds } = data;

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

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'permissionIds must be a non-empty array',
      });
    }

    for (const permissionId of permissionIds) {
      const permissionIdResult = validateRequired(
        permissionId,
        'Permission ID',
      );
      if (!permissionIdResult.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: permissionIdResult.message,
        });
      }

      const permissionIdValidation = validateUUID(
        permissionId,
        'Permission ID',
      );
      if (!permissionIdValidation.valid) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: permissionIdValidation.message,
        });
      }
    }
  }
}
