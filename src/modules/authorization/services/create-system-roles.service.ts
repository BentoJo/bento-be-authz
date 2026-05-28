import { Injectable } from '@nestjs/common';
import {
  CreateSystemRolesRequest,
  CreateSystemRolesResponse,
} from '../../../shared/types/types';
import {
  createRoleQuery,
  roleExistsByName,
  NewRoleRow,
} from '../../../shared/func/roles';
import { systemRoles, roles } from '../../../shared/db/schema';
import { and, eq } from 'drizzle-orm';
import db, { transaction } from '../../../shared/configs/db.config';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { upsertIamUser } from '../../../shared/func';
import {
  validateEnum,
  validateRequired,
  validateUUID,
} from '../../../shared/validations';
import { RoleScopeTypes } from '../../../shared/types/types';

@Injectable()
export class CreateSystemRoleService {
  async createSystemRole(
    data: CreateSystemRolesRequest,
  ): Promise<CreateSystemRolesResponse> {
    const { scopeType, scopeId, createdBy } = data;

    this.validateInput(data);

    // load system role names from the system_roles table
    const systemRoleRows = await db
      .select({ name: systemRoles.name })
      .from(systemRoles);

    const systemRoleNames = systemRoleRows.map((r) => r.name);

    // create missing system roles inside a transaction
    await transaction(async (tx) => {
      await upsertIamUser({ userId: createdBy }, tx as typeof db);

      for (const roleName of systemRoleNames) {
        const exists = await roleExistsByName(roleName, scopeType, scopeId);
        if (exists) continue;

        const payload: NewRoleRow = {
          name: roleName,
          scopeType,
          scopeId,
          isSystem: true,
          createdBy,
        };

        await createRoleQuery(payload, tx as typeof db);
      }
    });

    // return the system roles for this scope
    const created = await db
      .select({
        id: roles.id,
        name: roles.name,
        isSystem: roles.isSystem,
        isEditable: roles.isEditable,
        isDeletable: roles.isDeletable,
      })
      .from(roles)
      .where(
        and(
          eq(roles.scopeType, scopeType),
          eq(roles.scopeId, scopeId),
          eq(roles.isSystem, true),
        ),
      );

    return {
      roles: created.map((r) => ({
        id: r.id,
        name: r.name,
        isSystem: Boolean(r.isSystem),
        isEditable: Boolean(r.isEditable),
        isDeletable: Boolean(r.isDeletable),
      })),
    };
  }

  private validateInput(data: CreateSystemRolesRequest): void {
    const { scopeType, scopeId, createdBy } = data;

    const scopeTypeResult = validateRequired(scopeType, 'Scope Type');
    if (!scopeTypeResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeTypeResult.message,
      });
    }

    const scopeTypeValidation = validateEnum(
      scopeType,
      RoleScopeTypes,
      'Scope Type',
    );
    if (!scopeTypeValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeTypeValidation.message,
      });
    }

    const scopeIdResult = validateRequired(scopeId, 'Scope ID');
    if (!scopeIdResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeIdResult.message,
      });
    }

    const scopeIdValidation = validateUUID(scopeId, 'Scope ID');
    if (!scopeIdValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: scopeIdValidation.message,
      });
    }

    const createdByResult = validateRequired(createdBy, 'Created By');
    if (!createdByResult.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: createdByResult.message,
      });
    }

    const createdByValidation = validateUUID(createdBy, 'Created By');
    if (!createdByValidation.valid) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: createdByValidation.message,
      });
    }
  }
}
