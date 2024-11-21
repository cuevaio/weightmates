'use client';

import { useTeams } from '@/hooks/use-teams';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { dateFormatter } from '@/lib/utils';

import { CreateTeam } from './create-team';
import { GoTeamButton } from './go-team';

export default function Page() {
  const { data: turs } = useTeams();

  return (
    <div>
      <CreateTeam />
      <div className="grid grid-cols-3 gap-8">
        {turs?.map(({ team, joinedAt }) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>You joined at {dateFormatter(joinedAt)}</CardContent>
            <CardFooter>
              <GoTeamButton teamId={team.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
