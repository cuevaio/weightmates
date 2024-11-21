'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';
import { teamUserRelations } from '@/db/schema';

import { nanoid } from '@/lib/nanoid';

export async function add(formData: FormData): Promise<
  | {
      success: true;
    }
  | { success: false; error: string }
> {
  try {
    console.log(formData.get('weight'));
    const rawWeight = formData.get('weight');
    const parsedWeight = z.coerce
      .number()
      .min(30)
      .max(200)
      .safeParse(rawWeight);

    if (!parsedWeight.success) {
      throw new Error('Invalid weight');
    }

    const rawDate = formData.get('date');
    const parsedDate = z.string().date().safeParse(rawDate);

    if (!parsedDate.success) {
      throw new Error('Invalid date');
    }

    const session = await getSession();
    if (!session) throw new Error('First sign in');

    await db.insert(schema.measurements).values({
      id: nanoid(),
      userId: session.userId,
      weight: parsedWeight.data.toString(),
      measuredAt: parsedDate.data,
    });

    const turs = await db
      .select()
      .from(teamUserRelations)
      .where(eq(teamUserRelations.userId, session.userId));

    for (let i = 0; i < turs.length; i++) {
      revalidatePath('/teams/' + turs[i].teamId);
    }

    revalidatePath('/users/' + session.userId);

    return { success: true };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      if (error.constructor.name === 'NeonDbError') {
        const dbError = error as NeonDbError;
        if (dbError.constraint?.includes('weight_check')) {
          return {
            success: false,
            error: 'Weight value not allowed',
          };
        }
        return { success: false, error: 'DB error' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Something went wrong' };
  }
}
