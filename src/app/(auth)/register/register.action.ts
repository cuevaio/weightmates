'use server';

import { getUserAndSession } from '@/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';

export async function register(formData: FormData): Promise<
  | {
      success: true;
    }
  | { success: false; error: string }
> {
  try {
    const name = formData.get('name');

    const parsedName = z.string().min(2).safeParse(name);

    if (!parsedName.success) {
      throw new Error('Invalid name');
    }

    const auth = await getUserAndSession();
    if (!auth) throw new Error('First sign in');

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, auth.session.userId))
      .limit(1);
    if (user) throw new Error('Already registered');

    await db.insert(schema.users).values({
      id: auth.session.userId,
      name: parsedName.data,
      email: auth.user.email,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
