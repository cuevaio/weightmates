import { notFound } from 'next/navigation';

import { db, schema } from '@/db';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { dateFormatter } from '@/lib/utils';

import { AddMember } from './add-member';

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
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, teamId),
    with: {
      teamUserRelations: true,
    },
  });
  if (!team) return notFound();

  const members = await db.query.users.findMany({
    where: (users, { inArray }) =>
      inArray(
        users.id,
        team.teamUserRelations.map((x) => x.userId),
      ),
    orderBy: (users, { asc }) => asc(users.name),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full border text-xs font-black">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div>{member.name}</div>
                </div>
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {team.teamUserRelations
                  .find((r) => r.userId === member.id)
                  ?.role.toUpperCase()}
              </TableCell>
              <TableCell>
                <time>
                  {dateFormatter(
                    team.teamUserRelations.find((r) => r.userId === member.id)
                      ?.joinedAt ?? new Date(),
                  )}
                </time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AddMember />
    </div>
  );
}
