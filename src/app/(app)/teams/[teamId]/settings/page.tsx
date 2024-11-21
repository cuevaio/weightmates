'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useTeams } from '@/hooks/use-teams';
import { useAppStore } from '@/stores/providers/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { deleteTeam } from './delete-team.action';
import { updateName } from './update-name.action';

export default function Page() {
  const { data: teams } = useTeams();
  const { teamId } = useAppStore((s) => s);
  const trl = React.useMemo(
    () => teams?.find(({ team }) => team.id === teamId),
    [teamId, teams],
  );
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: mutateUpdateName, isPending: isPendingUpdateName } =
    useMutation({
      mutationFn: async (formData: FormData) => {
        if (teamId) {
          formData.append('teamId', teamId);
        }
        const result = await updateName(formData);

        if (!result.success) throw new Error(result.error);
      },
      onError: (error) => {
        alert(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      },
    });

  const { mutate: deleteTeamMutation, isPending: isPendingDelete } =
    useMutation({
      mutationFn: async (formData: FormData) => {
        if (teamId) {
          formData.append('teamId', teamId);
        }
        const result = await deleteTeam(formData);

        if (!result.success) throw new Error(result.error);
      },
      onError: (error) => {
        alert(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        router.push('/teams');
      },
    });

  return (
    <div className="grid grid-cols-1 gap-4">
      <form action={mutateUpdateName} className="flex items-end gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={trl?.team.name}
            disabled={isPendingUpdateName || trl?.role !== 'admin'}
          />
        </div>
        <Button
          type="submit"
          disabled={isPendingUpdateName || trl?.role !== 'admin'}
        >
          {isPendingUpdateName && <Loader2Icon className="mr-2 animate-spin" />}
          Update
        </Button>
      </form>
      {trl?.role === 'admin' && (
        <form className="" action={deleteTeamMutation}>
          <h3 className="font-bold text-destructive">Danger zone</h3>
          <Button
            type="submit"
            variant="destructive"
            disabled={isPendingDelete}
          >
            {isPendingDelete && <Loader2Icon className="mr-2 animate-spin" />}
            Delete team
          </Button>
        </form>
      )}
    </div>
  );
}
