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

    const turs = await db.query.teamUserRelations.findMany({
      where: (tur, { eq }) => eq(tur.userId, session.userId),
      with: {
        team: true,
      },
    });

    if (!turs) {
      throw new Error('Internal server error', {
        cause: 500,
      }); // user has to be created before going to (app)
    }

    return Response.json(
      { data: turs },
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
