import { Injectable } from '@nestjs/common';
import {
  GetStaticRolesRequest,
  GetStaticRolesResponse,
} from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import db from '../../../shared/configs/db.config';
import { roles } from '../../../shared/db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class GetSystemRolesService {
  async getSystemRoles(
    data: GetStaticRolesRequest,
  ): Promise<GetStaticRolesResponse> {
    const listRoles = await db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(and(eq(roles.isSystem, true), eq(roles.scopeId, data.scopeId)));

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
