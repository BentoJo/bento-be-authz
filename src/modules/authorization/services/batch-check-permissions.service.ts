import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  BatchCheckPermissionsRequest,
  BatchCheckPermissionsResponse,
} from '../../../shared/types/types';
import { listRolesByScope, RoleRow } from '../../../shared/func/roles';
import { getPermissionsForRole } from '../../../shared/func/role-permissions';

@Injectable()
export class BatchCheckPermissionsService {
  async batchCheckPermissions(
    data: BatchCheckPermissionsRequest,
  ): Promise<BatchCheckPermissionsResponse> {
    const { userId, scope, scopeId, permissions } = data;

    if (!userId || !scope || !scopeId || !Array.isArray(permissions)) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'Invalid request',
      });
    }

    const roles = await listRolesByScope(
      scope as RoleRow['scopeType'],
      scopeId,
      true,
    );

    const permsSet = new Set<string>();
    for (const r of roles) {
      const p = await getPermissionsForRole(r.id);
      p.forEach((x) => permsSet.add(x));
    }

    const results: Record<string, boolean> = {};
    for (const p of permissions) {
      results[p] = permsSet.has(p);
    }

    return { results };
  }
}
