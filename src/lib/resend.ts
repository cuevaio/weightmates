import { Resend } from 'resend';

import { singleton } from './singleton';

const createResend = () => {
  return new Resend(process.env.RESEND_API_KEY);
};

export const resend = singleton('resend', createResend);
