import { Injectable } from '@nestjs/common';
import {
  ListRolesRequest,
  ListRolesResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { listRolesByScope } from '../../../shared/func';

@Injectable()
export class GetRolesService {
  async getRoles(data: ListRolesRequest): Promise<ListRolesResponse> {
    const { scopeType, scopeId, includeSystemRoles } = data;

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
}
