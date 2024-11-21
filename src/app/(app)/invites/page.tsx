import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db } from '@/db';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

import { AcceptInvite } from './accept-invite';

export default async function Page() {
  const auth = await getUserAndSession();
  if (!auth) redirect('/login');

  const invites = await db.query.invitations.findMany({
    where: (invitations, { eq }) => eq(invitations.email, auth.user.email),
    with: {
      team: true,
    },
  });

  if (!invites.length) {
    return <p>You don&apos;t have invites right now</p>;
  }

  return (
    <div>
      {invites.map(({ team }) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <AcceptInvite teamId={team.id} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
