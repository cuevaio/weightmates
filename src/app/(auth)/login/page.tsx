'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { login } from './login.action';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await login(formData);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: ({ email }) => {
      const after = searchParams.get('after');

      const search = new URLSearchParams();
      search.set('email', email);
      if (after) {
        search.set('after', after);
      }

      router.push(`/validate?${search.toString()}`);
    },
  });

  return (
    <form action={mutate} className="flex w-full flex-col gap-4">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        disabled={isPending}
      />
      <Button className="w-full" disabled={isPending}>
        Continue
      </Button>
    </form>
  );
}
