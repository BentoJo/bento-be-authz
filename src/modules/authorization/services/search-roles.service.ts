import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  SearchRolesRequest,
  SearchRolesResponse,
} from '../../../shared/types/types';
import { listRolesByScope } from '../../../shared/func/roles';
import { scopeTypeEnum } from '../../../shared/db/schema';

@Injectable()
export class SearchRolesService {
  async searchRoles(data: SearchRolesRequest): Promise<SearchRolesResponse> {
    const { scope, scopeId, query, includeSystem = false } = data;
    const limit =
      typeof data.limit === 'number' && data.limit > 0 ? data.limit : 50;

    if (!scope || !scopeId) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'scope and scope_id are required',
      });
    }

    const roles = await listRolesByScope(
      scope as (typeof scopeTypeEnum.enumValues)[number],
      scopeId,
      includeSystem,
    );

    const normalized = (query || '').toLowerCase();

    const filtered = roles
      .filter((r) => r.name.toLowerCase().includes(normalized))
      .slice(0, limit);

    return { roles: filtered, totalFound: filtered.length };
  }
}
