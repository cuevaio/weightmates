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
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      measurements: {
        orderBy: (users, { desc }) => desc(users.measuredAt),
        limit: 100,
      },
    },
  });

  if (!user) notFound();

  const data = interpolateWeights(user.measurements as MeasurementSelect[]);

  const { text: message } = await generateText({
    model: openai('gpt-4o-mini'),
    system:
      'You are the WeightMates assistant, an app to loose weight with a team and compete with other teams.',
    prompt: `Write a motivational message for ${user.name} who started with ${user.measurements[user.measurements.length - 1].weight}kg in ${user.measurements[user.measurements.length - 1].measuredAt} and now ${new Date().toISOString().split('T')[0]} is ${user.measurements[0].weight}`,
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
      <p>{message}</p>
      <div className="h-[400px] w-full">
        <Chart weightData={data} />
      </div>
    </div>
  );
}
