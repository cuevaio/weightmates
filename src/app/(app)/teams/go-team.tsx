'use client';

import { useRouter } from 'next/navigation';

import { useAppStore } from '@/stores/providers/app';

import { Button } from '@/components/ui/button';

export const GoTeamButton = ({ teamId }: { teamId: string }) => {
  const { teamId: currentTeamId, setTeamId } = useAppStore((s) => s);
  const router = useRouter();

  const buttonClickHandler = () => {
    setTeamId(teamId);
    router.push('/teams/' + teamId);
  };

  return (
    <Button
      onClick={buttonClickHandler}
      variant={teamId === currentTeamId ? 'outline' : 'default'}
    >
      Go
    </Button>
  );
};
