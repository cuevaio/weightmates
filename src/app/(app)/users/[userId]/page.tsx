import { notFound } from 'next/navigation';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import { db, schema } from '@/db';
import { MeasurementSelect, UserSelect } from '@/db/schema';

import { Chart } from '@/components/chart';

import { interpolateWeights } from '@/lib/interpolate';

export const revalidate = 360;

export async function generateStaticParams() {
  const users = await db.select().from(schema.users);

  return users.map((u) => ({ userId: u.id }));
}

export default async function Page({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const today = new Date().toISOString().split('T')[0];

  const user = (await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      measurements: {
        orderBy: (measurements, { desc }) => desc(measurements.measuredAt),
        limit: 100,
        where: (measurements, { lte }) => lte(measurements.measuredAt, today),
      },
    },
  })) as UserSelect & {
    measurements: MeasurementSelect[];
  };

  if (!user) notFound();

  if (user.measurements.length < 2) {
    return <div>Add your weight history to continue</div>;
  }
  const lastMeasurement = user.measurements[0];
  const initialMeasurement = user.measurements[user.measurements.length - 1];
  const penultimateMeasurement = user.measurements[1];

  const totalLoss = lastMeasurement.weight - initialMeasurement.weight;

  const currentLossDays =
    (new Date(lastMeasurement.measuredAt).getTime() -
      new Date(initialMeasurement.measuredAt).getTime()) /
    1000 /
    3600 /
    24;

  const totalWeeklyLoss = totalLoss / (currentLossDays / 7);

  const totalLossRatePercentage =
    (lastMeasurement.weight / initialMeasurement.weight) **
      (7 / currentLossDays) -
    1;

  const currentLossRate =
    ((lastMeasurement.weight - penultimateMeasurement.weight) /
      currentLossDays) *
    7;

  const currentLossRatePercentage =
    (lastMeasurement.weight / penultimateMeasurement.weight) **
      (7 / currentLossDays) -
    1;

  const data = interpolateWeights(user.measurements as MeasurementSelect[]);

  for (
    let i = 0;
    i <
    (new Date().getTime() - new Date(lastMeasurement.measuredAt).getTime()) /
      1000 /
      3600 /
      24;
    i++
  ) {
    data.push({
      date: new Date(
        new Date(lastMeasurement.measuredAt).getTime() + 24 * 3600 * 1000 * i,
      )
        .toISOString()
        .split('T')[0],
      interpolated: true,
      weight: lastMeasurement.weight,
    });
  }

  let prompt = '';

  if (user.measurements.length > 1) {
    prompt = `Write a motivational message for ${user.name} who started with ${user.measurements[user.measurements.length - 1].weight}kg in ${user.measurements[user.measurements.length - 1].measuredAt} and now ${new Date().toISOString().split('T')[0]} is ${user.measurements[0].weight}. If the user has not lossed weight, but gained, then motivate him o her to work harder. If he or she has loosed weight, congratulate him/her.`;
  } else {
    prompt = `Write a welcome message to WeightMates app for ${user.name}`;
  }

  const { text: message } = await generateText({
    model: openai('gpt-4o-mini'),
    system:
      'You are the WeightMates assistant, an app to loose weight with a team and compete with other teams.',
    prompt,
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
      <div className="my-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
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
          per week (historical)
        </div>
        <div
          className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
          data-increasing={totalLossRatePercentage > 0}
        >
          <span className="text-4xl font-bold tabular-nums">
            {Math.abs(
              Math.round(totalLossRatePercentage * 10000) / 100,
            ).toFixed(2)}
            %
            {totalLossRatePercentage > 0 ? (
              <TrendingUpIcon className="inline-flex size-6" />
            ) : (
              <TrendingDownIcon className="inline-flex size-6" />
            )}
          </span>{' '}
          per week (historical)
        </div>
        <div
          className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
          data-increasing={currentLossRate > 0}
        >
          <span className="text-4xl font-bold tabular-nums">
            {Math.abs(Math.round(currentLossRate * 100) / 100).toFixed(2)}kg
            {currentLossRate > 0 ? (
              <TrendingUpIcon className="inline-flex size-6" />
            ) : (
              <TrendingDownIcon className="inline-flex size-6" />
            )}
          </span>{' '}
          per week (last weigh-in)
        </div>
        <div
          className="data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
          data-increasing={currentLossRatePercentage > 0}
        >
          <span className="text-4xl font-bold tabular-nums">
            {Math.abs(
              Math.round(currentLossRatePercentage * 10000) / 100,
            ).toFixed(2)}
            %
            {currentLossRatePercentage > 0 ? (
              <TrendingUpIcon className="inline-flex size-6" />
            ) : (
              <TrendingDownIcon className="inline-flex size-6" />
            )}
          </span>{' '}
          per week (last weigh-in)
        </div>
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
      </div>
      <Chart weightData={data} />
      <div className="my-8">
        <p className="my-8 ml-8 border-l-4 pl-4">{message}</p>
        <p className="text-right text-sm">- WeightMates AI</p>
      </div>
    </div>
  );
}
