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

import { addMember } from './add-member.action';

export function AddMember() {
  const { data: teams } = useTeams();
  const { teamId } = useAppStore((s) => s);
  const trl = React.useMemo(
    () => teams?.find(({ team }) => team.id === teamId),
    [teamId, teams],
  );
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      if (teamId) {
        formData.append('teamId', teamId);
      }
      const result = await addMember(formData);

      if (!result.success) throw new Error(result.error);
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push('/teams/' + teamId + '/invites');
    },
  });

  if (trl?.role !== 'admin') {
    return null;
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4">
      <p className="text-sm">Add your friends</p>
      <form action={mutate} className="flex items-end gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" disabled={isPending} />
        </div>
        <Button type="submit">
          {isPending && <Loader2Icon className="mr-2 animate-spin" />}
          Send invite
        </Button>
      </form>
    </div>
  );
}
