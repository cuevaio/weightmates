import { NextRequest } from 'next/server';

import { nocache_getSession } from '@/auth/middleware';

import { db } from '@/db';

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export const GET = async (request: NextRequest) => {
  try {
    const session = await nocache_getSession(request);

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
