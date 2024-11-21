import { notFound } from 'next/navigation';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { db, schema } from '@/db';
import { MeasurementSelect } from '@/db/schema';

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

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      measurements: {
        orderBy: (measurements, { desc }) => desc(measurements.measuredAt),
        limit: 100,
        where: (measurements, { lte }) => lte(measurements.measuredAt, today),
      },
    },
  });

  if (!user) notFound();

  const data = interpolateWeights(user.measurements as MeasurementSelect[]);

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
      <div className="my-4 grid grid-cols-1 gap-4">
        <p className="">{message}</p>
        <Chart weightData={data} />
      </div>
    </div>
  );
}
