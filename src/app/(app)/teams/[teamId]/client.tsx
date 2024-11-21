'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [percentage, setPercentage] = React.useState(true);

  return (
    <div className="group" data-percentage={percentage}>
      {children}

      <div className="mt-2 flex items-center gap-2 text-muted-foreground">
        <Label htmlFor="percentage">Show percentages</Label>
        <Switch
          id="percentage"
          checked={percentage}
          onCheckedChange={setPercentage}
        />
      </div>
    </div>
  );
};
