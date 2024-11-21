'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAppStore } from '@/stores/providers/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createTeam } from './create-team.action';

export const CreateTeam = () => {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { setTeamId } = useAppStore((s) => s);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createTeam(formData);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: ({ teamId }) => {
      setTeamId(teamId);

      queryClient.invalidateQueries({ queryKey: ['teams'] });

      setOpen(false);
      router.push('/teams/' + teamId);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Create Team</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Create Team</DialogHeader>
        <DialogDescription>
          Stay motivated with your team members
        </DialogDescription>
        <form action={mutate} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" disabled={isPending} />
          </div>
          <DialogFooter className="gap-4 space-x-0 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isPending}>
                Close
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
