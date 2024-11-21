import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dateFormatter = (value: string | Date) => {
  if (value instanceof Date)
    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Europe/London',
    });

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Europe/London',
  });
};
