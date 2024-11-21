'use server';

import { getSession } from '@/auth';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';

export async function updateName(formData: FormData): Promise<
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

    const teamId = formData.get('teamId');
    const parsedTeamId = z.string().length(12).safeParse(teamId);

    if (!parsedTeamId.success) {
      throw new Error('Invalid team id');
    }

    const session = await getSession();
    if (!session) throw new Error('First sign in');

    const [tur] = await db
      .select()
      .from(schema.teamUserRelations)
      .where(
        and(
          eq(schema.teamUserRelations.teamId, parsedTeamId.data),
          eq(schema.teamUserRelations.userId, session.userId),
        ),
      );

    if (!tur) throw new Error('Invalid team id'); // maybe user don't belong to the team, maybe the team doesn't exists
    // in any case, we don't gave the user much detail for security reasons

    if (tur.role !== 'admin') throw new Error('You are not an admin bro');

    await db
      .update(schema.teams)
      .set({
        name: parsedName.data,
      })
      .where(eq(schema.teams.id, tur.teamId));

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
