import { eq } from 'drizzle-orm';

import { db, schema } from '@/db';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { dateFormatter } from '@/lib/utils';

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
  const invites = await db
    .select()
    .from(schema.invitations)
    .where(eq(schema.invitations.teamId, teamId));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead>Sent at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.email}>
              <TableCell>{invite.email}</TableCell>

              <TableCell>
                <time>{dateFormatter(invite.createdAt)}</time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {invites.length === 0 && (
          <TableCaption>
            No invitations right now. Send invitations in the members page.
          </TableCaption>
        )}
      </Table>
    </div>
  );
}
