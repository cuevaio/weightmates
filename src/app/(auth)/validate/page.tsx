'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { otpAlphabetRegex } from '@/lib/nanoid';

import { validate } from './validate.action';

export default function Validate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await validate(formData);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: (data) => {
      if (data.newUser) {
        router.push('/register');
      }
      const after = searchParams.get('after');

      if (after) {
        // TODO: Validate that after is a valid pathname
        router.push(after);
      } else {
        router.push('/');
      }
    },
  });

  return (
    <form action={mutate} className="flex w-full flex-col gap-4">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        disabled={isPending}
        defaultValue={searchParams.get('email') ?? ''}
      />

      <InputOTP maxLength={6} name="otp" pattern={otpAlphabetRegex}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Button className="w-full" disabled={isPending}>
        Login
      </Button>
    </form>
  );
}
