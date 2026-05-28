import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  BatchCheckPermissionsRequest,
  BatchCheckPermissionsResponse,
} from '../../../shared/types/types';
import { getPermissionsForRole } from '../../../shared/func/role-permissions';

@Injectable()
export class BatchCheckPermissionsService {
  async batchCheckPermissions(
    data: BatchCheckPermissionsRequest,
  ): Promise<BatchCheckPermissionsResponse> {
    const { roleId, permissions } = data;

    if (!roleId || !Array.isArray(permissions)) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'Invalid request',
      });
    }

    const rolePermissions = await getPermissionsForRole(roleId);
    const permsSet = new Set(rolePermissions);

    const results: Record<string, boolean> = {};
    for (const p of permissions) {
      results[p] = permsSet.has(p);
    }

    return { results };
  }
}
