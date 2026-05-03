import { eq, inArray } from 'drizzle-orm';
import db from '../configs/db.config';
import { iam } from '../db/schema';

export type IamRow = typeof iam.$inferSelect;
export type NewIamRow = typeof iam.$inferInsert;

export async function getIamUserById(userId: string) {
  const [row] = await db.select().from(iam).where(eq(iam.userId, userId));
  return row ?? null;
}

export async function iamUserExists(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: iam.userId })
    .from(iam)
    .where(eq(iam.userId, userId));
  return Boolean(row);
}

export async function createIamUser(data: NewIamRow): Promise<IamRow> {
  const [row] = await db.insert(iam).values(data).returning();
  if (!row) {
    throw new Error('Failed to create iam row');
  }

  return row;
}

export async function upsertIamUser(data: NewIamRow): Promise<IamRow> {
  const [row] = await db
    .insert(iam)
    .values(data)
    .onConflictDoUpdate({
      target: iam.userId,
      set: {
        userId: data.userId,
      },
    })
    .returning();

  if (!row) {
    throw new Error('Failed to upsert iam row');
  }

  return row;
}

export async function deleteIamUser(userId: string): Promise<boolean> {
  const result = await db
    .delete(iam)
    .where(eq(iam.userId, userId))
    .returning({ userId: iam.userId });
  return result.length > 0;
}

export async function deleteManyIamUsers(userIds: string[]): Promise<number> {
  if (userIds.length === 0) {
    return 0;
  }

  const result = await db
    .delete(iam)
    .where(inArray(iam.userId, userIds))
    .returning({ userId: iam.userId });
  return result.length;
}
