import fs from 'node:fs/promises';
import path from 'node:path';

import { eq, inArray } from 'drizzle-orm';
import Papa from 'papaparse';

import { db, schema } from '@/db';
import { UserInsert, type MeasurementInsert } from '@/db/schema';

import { nanoid } from '@/lib/nanoid';
import { redis } from '@/lib/redis';

(async () => {
  const csvPath = path.join(import.meta.dirname, 'initial-measurements.csv');
  const text = await fs.readFile(csvPath, 'utf8');

  const result = Papa.parse(text, {
    header: true,
  });

  if (!result.data.length) throw new Error('wrong csv');
  let rows = result.data as unknown as { [key: string]: string }[];
  rows = rows.filter((x) => Object.keys(x).length > 1);

  const users: UserInsert[] = Object.keys(rows[0])
    .filter((x) => x !== 'date')
    .map((u) => ({
      id: nanoid(),
      name: u,
      email:
        u === 'Michael'
          ? 'honige3272@exoular.com'
          : u.toLowerCase() + '@moversmarket.co.uk',
    }));

  const existing_users = await db
    .select()
    .from(schema.users)
    .where(
      inArray(
        schema.users.email,
        users.map((u) => u.email!),
      ),
    );

  // delete existing data
  await db.delete(schema.measurements).where(
    inArray(
      schema.measurements.userId,
      existing_users.map((u) => u.id!),
    ),
  );
  await db.delete(schema.teamUserRelations).where(
    inArray(
      schema.teamUserRelations.userId,
      existing_users.map((u) => u.id!),
    ),
  );
  await db.delete(schema.users).where(
    inArray(
      schema.users.id,
      existing_users.map((u) => u.id!),
    ),
  );

  // create data
  await db.insert(schema.users).values(users);

  const teamId = 'MMMMMMMMMMMM';
  const existing_team = await db
    .select()
    .from(schema.teams)
    .where(eq(schema.teams.id, teamId));

  if (!existing_team) {
    await db.insert(schema.teams).values({ id: teamId, name: 'Movers Market' });
  }

  await db.insert(schema.teamUserRelations).values(
    users.map((user) => ({
      userId: user.id,
      teamId,
      role: user.name === 'Michael' ? ('admin' as const) : ('member' as const),
    })),
  );

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    await redis.set(`userIdByEmail:${user.email}`, user.id);
    await redis.hset(`user:${user.id}`, {
      email: user.email,
      createdAt: new Date().toISOString(),
    });
  }

  const measurements: MeasurementInsert[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const date = row.date;

    Object.keys(row)
      .filter((x) => x !== 'date' && !!row[x])
      .forEach((u) => {
        measurements.push({
          id: nanoid(),
          userId: users.find((x) => x.name === u)!.id,
          weight: row[u],
          measuredAt: date,
        });
      });
  }

  await db.insert(schema.measurements).values(measurements);

  console.log('DONE!');
})();
