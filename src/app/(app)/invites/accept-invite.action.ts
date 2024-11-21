'use server';

import { revalidatePath } from 'next/cache';

import { getUserAndSession } from '@/auth';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';

export async function acceptInvite(formData: FormData): Promise<
  | {
      success: true;
    }
  | { success: false; error: string }
> {
  try {
    const teamId = formData.get('teamId');
    const parsedTeamId = z.string().length(12).safeParse(teamId);

    if (!parsedTeamId.success) {
      throw new Error('Invalid team id');
    }

    const auth = await getUserAndSession();
    if (!auth) throw new Error('First sign in');

    const { session, user } = auth;

    const [invite] = await db
      .select()
      .from(schema.invitations)
      .where(
        and(
          eq(schema.invitations.teamId, parsedTeamId.data),
          eq(schema.invitations.email, user.email),
        ),
      );

    if (!invite) throw new Error('Invalid team id'); // maybe user don't belong to the team, maybe the team doesn't exists
    // in any case, we don't gave the user much detail for security reasons

    await db
      .insert(schema.teamUserRelations)
      .values({ teamId: parsedTeamId.data, userId: session.userId });

    await db
      .delete(schema.invitations)
      .where(
        and(
          eq(schema.invitations.teamId, parsedTeamId.data),
          eq(schema.invitations.email, user.email),
        ),
      );

    revalidatePath('/invites');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
