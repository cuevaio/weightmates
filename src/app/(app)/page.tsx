import { redirect } from 'next/navigation';

import { getSession } from '@/auth';

import { db } from '@/db';
import { MeasurementSelect } from '@/db/schema';

import { Chart } from '@/components/chart';

import { interpolateWeights } from '@/lib/interpolate';

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, '3oCxoT4yDNRc'),
    with: {
      measurements: {
        orderBy: (users, { asc }) => asc(users.measuredAt),
      },
    },
  });

  if (!user) redirect('/register');

  const data = interpolateWeights(user.measurements as MeasurementSelect[]);

  return (
    <>
      <h1>Hi, {user.name} </h1>
      <div className="h-[400px] w-[600px]">
        <Chart weightData={data} />
      </div>
    </>
  );
}
