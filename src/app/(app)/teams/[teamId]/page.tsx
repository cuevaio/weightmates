import { notFound } from 'next/navigation';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

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

  const totalLoss = members.reduce((prev, member) => {
    if (member.measurements.length > 1) {
      return (
        prev +
        member.measurements[0].weight -
        member.measurements[member.measurements.length - 1].weight
      );
    } else {
      return prev;
    }
  }, 0);

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

  const totalWeeklyLoss = totalLoss / (len / 7);

  const avgLoss =
    totalLoss / members.filter((m) => m.measurements.length > 1).length;
  const avgLossWeekly =
    avgLoss / members.filter((m) => m.measurements.length > 1).length;

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
      <h1 className="text-xl font-bold">{team.name}</h1>

      <div className="my-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-0">
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          <div
            className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
            data-increasing={totalLoss > 0}
          >
            <span className="text-4xl font-bold tabular-nums">
              {Math.abs(Math.round(totalLoss * 100) / 100).toFixed(2)}kg
              {totalLoss > 0 ? (
                <TrendingUpIcon className="inline-flex size-6" />
              ) : (
                <TrendingDownIcon className="inline-flex size-6" />
              )}
            </span>{' '}
            total
          </div>
          <div
            className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
            data-increasing={totalWeeklyLoss > 0}
          >
            <span className="text-4xl font-bold tabular-nums">
              {Math.abs(Math.round(totalWeeklyLoss * 100) / 100).toFixed(2)}kg
              {totalWeeklyLoss > 0 ? (
                <TrendingUpIcon className="inline-flex size-6" />
              ) : (
                <TrendingDownIcon className="inline-flex size-6" />
              )}
            </span>{' '}
            total per week
          </div>

          <div
            className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
            data-increasing={avgLoss > 0}
          >
            <span className="text-4xl font-bold tabular-nums">
              {Math.abs(Math.round(avgLoss * 100) / 100).toFixed(2)}kg
              {avgLoss > 0 ? (
                <TrendingUpIcon className="inline-flex size-6" />
              ) : (
                <TrendingDownIcon className="inline-flex size-6" />
              )}
            </span>{' '}
            avg per member
          </div>
          <div
            className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
            data-increasing={avgLossWeekly > 0}
          >
            <span className="text-4xl font-bold tabular-nums">
              {Math.abs(Math.round(avgLossWeekly * 100) / 100).toFixed(2)}kg
              {avgLossWeekly > 0 ? (
                <TrendingUpIcon className="inline-flex size-6" />
              ) : (
                <TrendingDownIcon className="inline-flex size-6" />
              )}
            </span>{' '}
            avg per member - week
          </div>
        </div>
      </div>
      <Chart weightData={data} />

      <div className="my-8">
        <p className="my-8 ml-8 border-l-4 pl-4">{message}</p>
        <p className="text-right text-sm">- WeightMates AI</p>
      </div>

      <MembersTable members={members} />
    </div>
  );
}
