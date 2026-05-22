import { Injectable } from '@nestjs/common';
import {
  DeleteRoleResponse,
  DeleteRoleRequest,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { deleteRoleQuery, getRoleById } from '../../../shared/func';
import { RedisService } from '../../redis/redis.service';
import { validateRequired, validateUUID } from '../../../shared/validations';

@Injectable()
export class DeleteRoleService {
  constructor(private readonly redisService: RedisService) {}

  async deleteRole(data: DeleteRoleRequest): Promise<DeleteRoleResponse> {
    const { roleId } = data;

    this.validateInput(roleId);

    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    if (!existingRole.isDeletable) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: 'Role is not deletable',
      });
    }

    const deletedRole = await deleteRoleQuery(roleId);

    if (!deletedRole) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to delete role',
      });
    }

    await this.redisService.del(`authz:role_permissions:${roleId}`);

    return {
      success: true,
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
