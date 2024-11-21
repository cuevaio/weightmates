'use server';

import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';

import { redis } from '@/lib/redis';

export async function validate(formData: FormData): Promise<
  | {
      success: true;
      data: { newUser: boolean };
    }
  | { success: false; error: string }
> {
  try {
    const email = formData.get('email');
    const otp = formData.get('otp');
    console.log(email);
    console.log(otp);

    const parsedEmail = z.string().email().safeParse(email);
    const parsedOtp = z.string().min(6).safeParse(otp);

    if (!parsedEmail.success) {
      throw new Error('Invalid email');
    }

    if (!parsedOtp.success) {
      throw new Error('Invalid OTP');
    }

    const dontMatch = 'OTP and email do not match';

    const existingUserId = await redis.get<string>(
      `userIdByEmail:${parsedEmail.data}`,
    );

    if (!existingUserId) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      throw new Error(dontMatch);
    }

    const storedOtp = await redis.get<string>(`otpByUserId:${existingUserId}`);

    if (storedOtp !== parsedOtp.data) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      throw new Error(dontMatch);
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, existingUserId))
      .limit(1);

    const sessionToken = generateSessionToken();
    await createSession(sessionToken, existingUserId);

    await setSessionTokenCookie(sessionToken);

    return { success: true, data: { newUser: !user.length } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
