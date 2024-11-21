'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

import { add } from './add.action';

export const AddMeasurement = () => {
  const [date, setDate] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { data: user } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append('date', date!.toISOString().split('T')[0]);
      const result = await add(formData);

      if (!result.success) throw new Error(result.error);
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: () => {
      setOpen(false);
      if (user) {
        router.push('/users/' + user.id);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="" variant="outline">
          Add Measurement
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px]">
        <DialogHeader>Add Measurement</DialogHeader>
        <DialogDescription>Track your progress</DialogDescription>
        <form action={mutate} className="space-y-4">
          <Input
            type="number"
            name="weight"
            placeholder="Weight"
            disabled={isPending}
            step="0.01"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                required
              />
            </PopoverContent>
          </Popover>
          <DialogFooter className="gap-4 space-x-0 sm:space-x-0">
            <Button type="submit" className="w-full" disabled={isPending}>
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
