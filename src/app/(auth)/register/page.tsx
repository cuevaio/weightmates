'use client';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { register } from './register.action';

export default function Register() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await register(formData);

      if (!result.success) throw new Error(result.error);
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: () => {
      router.push(`/app`);
    },
  });

  return (
    <form action={mutate} className="flex w-full flex-col gap-4">
      <Input type="name" name="name" placeholder="Name" disabled={isPending} />
      <Button className="w-full" disabled={isPending}>
        Login
      </Button>
    </form>
  );
}
