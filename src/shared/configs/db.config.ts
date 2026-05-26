import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);

export default db;

export async function transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return db.transaction(fn);
}
