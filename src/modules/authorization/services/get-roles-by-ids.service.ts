import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  GetUserRolesRequest,
  GetUserRolesResponse,
} from '../../../shared/types/types';
import { getRolesByIdsAndScope, RoleRow } from '../../../shared/func/roles';

@Injectable()
export class GetUserRolesService {
  async getUserRoles(data: GetUserRolesRequest): Promise<GetUserRolesResponse> {
    const { roleIds, scope, scopeId } = data;

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'rolesIds must be a non-empty array',
      });
    }

    if (!scope || !scopeId) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'scope and scopeId are required',
      });
    }

    const roles = await getRolesByIdsAndScope(
      roleIds,
      scope as RoleRow['scopeType'],
      scopeId,
      true,
    );

    return {
      scope,
      scopeId,
      roles,
    };
  }
}
