'use client';

import { useRouter } from 'next/navigation';

import { useAppStore } from '@/stores/providers/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { acceptInvite } from './accept-invite.action';

export const AcceptInvite = ({ teamId }: { teamId: string }) => {
  const queryClient = useQueryClient();
  const { setTeamId } = useAppStore((s) => s);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      if (teamId) {
        formData.append('teamId', teamId);
      }
      const result = await acceptInvite(formData);

      if (!result.success) throw new Error(result.error);
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: () => {
      setTeamId(teamId);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push('/teams/' + teamId);
    },
  });

  return (
    <form action={mutate}>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Accept Invite
      </Button>
    </form>
  );
};
