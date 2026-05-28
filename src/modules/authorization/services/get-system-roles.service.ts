import { Injectable } from '@nestjs/common';
import { GetStaticRolesResponse } from '../../../shared/types/types';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import db from '../../../shared/configs/db.config';
import { systemRoles } from '../../../shared/db/schema';

@Injectable()
export class GetSystemRolesService {
  async getSystemRoles(): Promise<GetStaticRolesResponse> {
    const listRoles = await db
      .select({ id: systemRoles.id, name: systemRoles.name })
      .from(systemRoles);

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
