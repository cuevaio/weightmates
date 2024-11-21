import { notFound } from 'next/navigation';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { db, schema } from '@/db';
import { MeasurementSelect, UserSelect } from '@/db/schema';

import { Chart } from '@/components/chart';

import { DailyWeight, interpolateWeights } from '@/lib/interpolate';

import { MembersTable } from './table';

export const revalidate = 360;

export async function generateStaticParams() {
  const teams = await db.select().from(schema.teams);

  return teams.map((t) => ({ teamId: t.id }));
}

export default async function Page({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const today = new Date().toISOString().split('T')[0];
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, teamId),
    with: {
      teamUserRelations: true,
    },
  });

  if (!team) return notFound();

  const members = (await db.query.users.findMany({
    where: (users, { inArray }) =>
      inArray(
        users.id,
        team.teamUserRelations.map((x) => x.userId),
      ),
    orderBy: (users, { asc }) => asc(users.name),
    with: {
      measurements: {
        where: (measurements, { lte }) => lte(measurements.measuredAt, today),
        orderBy: (measurements, { desc }) => desc(measurements.measuredAt),
        limit: 100,
      },
    },
  })) as (UserSelect & {
    measurements: MeasurementSelect[];
  })[];

  const dataPerMember = members.map((user) =>
    interpolateWeights(user.measurements),
  );

  const start = dataPerMember.reduce(
    (prev, current) => {
      if (current.length > 0) {
        return new Date(
          Math.min(
            new Date(prev).getTime(),
            new Date(current[0].date).getTime(),
          ),
        )
          .toISOString()
          .split('T')[0];
      } else {
        return prev;
      }
    },
    dataPerMember[0][0]?.date ?? new Date().toISOString().split('T')[0],
  );

  const data: DailyWeight[] = [];
  const len =
    (new Date(today).getTime() - new Date(start).getTime()) / 1000 / 3600 / 24;

  for (let i = 0; i <= len; i++) {
    const date = new Date(new Date(start).getTime() + 24 * 3600 * 1000 * i)
      .toISOString()
      .split('T')[0];

    const [sum, exact] = dataPerMember.reduce(
      (prev, measurementsOfCurrentMember) => {
        if (measurementsOfCurrentMember.length > 0) {
          const a = measurementsOfCurrentMember.find((x) => x.date === date);

          return [
            prev[0] +
              (a?.weight ??
                measurementsOfCurrentMember[
                  measurementsOfCurrentMember.length - 1
                ].weight),
            prev[1] || (a ? !a.interpolated : false),
          ];
        } else {
          return prev;
        }
      },
      [0, false],
    );

    data.push({
      date,
      weight:
        Math.round(
          (sum / members.filter((m) => m.measurements.length > 1).length) * 100,
        ) / 100,
      interpolated: !exact,
    });
  }
  const prompt = `The team named ${team.name} has been loosing weight together since ${team.createdAt}. They started with ${data[0].weight} in ${data[0].date} and right now they are in ${data[data.length - 1].weight}. Write a congratulation message if they have loosed weight or a motivational message if not.`;

  const { text: message } = await generateText({
    model: openai('gpt-4o-mini'),
    system:
      'You are the WeightMates assistant, an app to loose weight with a team and compete with other teams.',
    prompt,
  });

  return (
    <div className="container mx-auto">
      <h1>{team.name} </h1>
      <p className="my-4">{message}</p>

      <div className="grid grid-cols-1 gap-4">
        <Chart weightData={data} />
        <MembersTable members={members} />
      </div>
    </div>
  );
}
