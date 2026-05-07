// import { Injectable } from '@nestjs/common';
// import {
//   CheckPermissionRequest,
//   CheckPermissionResponse,
// } from '../../../shared/types/types';
// import { RpcException } from '@nestjs/microservices';
// import { status as GrpcStatus } from '@grpc/grpc-js';
// import { listRolesByScope } from '../../../shared/func';

// @Injectable()
// export class CheckPermissionService {
//   async checkPermission(
//     data: CheckPermissionRequest,
//   ): Promise<CheckPermissionResponse> {
//     const { scopeType, scopeId, permission, resourceId, userId, roleId } = data;

//     const listRoles = await listRolesByScope(
//       scopeType,
//       scopeId,
//       includeSystemRoles,
//     );

//     if (!listRoles) {
//       throw new RpcException({
//         code: GrpcStatus.INTERNAL,
//         message: 'Failed to list roles',
//       });
//     }

//     return {
//       roles: listRoles,
//     };
//   }
// }
