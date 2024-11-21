'use server';

import { getSession } from '@/auth';
import { z } from 'zod';

import { db, schema } from '@/db';

import { nanoid } from '@/lib/nanoid';

export async function createTeam(formData: FormData): Promise<
  | {
      success: true;
      data: {
        teamId: string;
      };
    }
  | { success: false; error: string }
> {
  try {
    const name = formData.get('name');

    const parsedName = z.string().min(2).safeParse(name);

    if (!parsedName.success) {
      throw new Error('Invalid name');
    }

    const session = await getSession();
    if (!session) throw new Error('First sign in');
    const id = nanoid();
    await db.insert(schema.teams).values({ id, name: parsedName.data });

    await db.insert(schema.teamUserRelations).values({
      teamId: id,
      userId: session.userId,
      role: 'admin',
    });

    return { success: true, data: { teamId: id } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
