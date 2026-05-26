import { Injectable } from '@nestjs/common';
import {
  ListPermissionsResponse,
  Permission,
} from '../../../shared/types/types';
import { listPermissions } from '../../../shared/func/permissions';

@Injectable()
export class ListPermissionsService {
  async listPermissions(): Promise<ListPermissionsResponse> {
    // scope and include_metadata currently not used in this simple implementation
    const rows = await listPermissions();

    const permissions: Permission[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      // resource: '',
      // action: '',
      // description: '',
      // tags: [],
    }));

    return {
      permissions,
      totalCount: permissions.length ? permissions.length : undefined,
    };
  }
}
