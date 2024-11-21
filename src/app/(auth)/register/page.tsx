'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { register } from './register.action';

export default function Register() {
  const router = useRouter();
  const { data: user } = useAuth();

  React.useEffect(() => {
    if (user) {
      router.push('/teams');
    }
  }, [user, router]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await register(formData);

      if (!result.success) throw new Error(result.error);
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: () => {
      router.push(`/teams`);
    },
  });

  return (
    <form action={mutate} className="flex w-full flex-col gap-4">
      <Input type="name" name="name" placeholder="Name" disabled={isPending} />
      <Button className="w-full" disabled={isPending}>
        Complete registration
      </Button>
    </form>
  );
}
