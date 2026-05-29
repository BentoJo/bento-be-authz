// import { Injectable } from '@nestjs/common';
// import { RpcException } from '@nestjs/microservices';
// import { status as GrpcStatus } from '@grpc/grpc-js';
// import {
//   BatchCheckPermissionsRequest,
//   BatchCheckPermissionsResponse,
// } from '../../../shared/types/types';
// import { getPermissionsForRole } from '../../../shared/func/role-permissions';

// @Injectable()
// export class BatchCheckPermissionsService {
//   async batchCheckPermissions(
//     data: BatchCheckPermissionsRequest,
//   ): Promise<BatchCheckPermissionsResponse> {
//     const { roleId, permissions } = data;

//     if (!roleId || !Array.isArray(permissions)) {
//       throw new RpcException({
//         code: GrpcStatus.INVALID_ARGUMENT,
//         message: 'Invalid request',
//       });
//     }

//     const rolePermissions = await getPermissionsForRole(roleId);
//     const permsSet = new Set(rolePermissions);

//     const results: Record<string, boolean> = {};
//     for (const p of permissions) {
//       results[p] = permsSet.has(p);
//     }

//     return { results };
//   }
// }

import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  BatchCheckPermissionsRequest,
  BatchCheckPermissionsResponse,
} from '../../../shared/types/types';
import {
  getPermissionsForRole,
  getPermissionsForSystemRole,
} from '../../../shared/func/role-permissions';
import { getRoleById } from '../../../shared/func/roles';
import { RedisService } from '../../redis/redis.service';

const ROLE_TTL_SECONDS = 60 * 5;

@Injectable()
export class BatchCheckPermissionsService {
  constructor(private readonly redisService: RedisService) {}

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

    const role = await getRoleById(roleId);

    if (!role) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Role not found',
      });
    }

    const cacheKey = role.isSystem
      ? `authz:system_role_permissions:${roleId}`
      : `authz:role_permissions:${roleId}`;

    let rolePermissions: string[] = [];

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as unknown;
        if (
          Array.isArray(parsed) &&
          parsed.every((v) => typeof v === 'string')
        ) {
          rolePermissions = parsed;
        } else {
          rolePermissions = [];
        }
      } catch {
        rolePermissions = [];
      }
    } else {
      rolePermissions = role.isSystem
        ? await getPermissionsForSystemRole(role.systemRoleId!)
        : await getPermissionsForRole(roleId);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(rolePermissions),
        ROLE_TTL_SECONDS,
      );
    }

    const permsSet = new Set(rolePermissions);

    const results: Record<string, boolean> = {};

    for (const p of permissions) {
      results[p] = permsSet.has(p);
    }

    return { results };
  }
}
