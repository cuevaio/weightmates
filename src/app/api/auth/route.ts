import { getSession } from '@/auth';

import { db } from '@/db';

export const GET = async () => {
  try {
    const session = await getSession();

    if (!session) {
      throw new Error('First login', {
        cause: 400,
      });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user) {
      throw new Error('Register first', {
        cause: 400,
      }); // user has to be created before going to (app)
    }

    return Response.json(
      { data: user },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof Error && typeof error.cause === 'number') {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: error.cause,
        },
      );
    }

    return Response.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      },
    );
  }
};
