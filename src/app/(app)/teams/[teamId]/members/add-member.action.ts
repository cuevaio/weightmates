'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/auth';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';

import { resend } from '@/lib/resend';

export async function addMember(formData: FormData): Promise<
  | {
      success: true;
    }
  | { success: false; error: string }
> {
  try {
    const email = formData.get('email');

    const parsedEmail = z.string().email().safeParse(email);

    if (!parsedEmail.success) {
      throw new Error('Invalid email');
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

    const [team] = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, tur.teamId))
      .limit(1);

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId));

    if (tur.role !== 'admin') throw new Error('You are not an admin bro');

    await resend.emails.send({
      from: 'invites@updates.cueva.io',
      to: parsedEmail.data,
      subject: 'You have been invited to ' + team.name,
      text: `${user.name} has invited you to his team ${team.name}. Join them in WeightMates to start loosing some weight togeter! Accept the invite in https://weight.cueva.io/invites`,
    });

    await db
      .insert(schema.invitations)
      .values({ email: parsedEmail.data, teamId: tur.teamId });

    revalidatePath('/teams/' + team.id + '/invites');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
