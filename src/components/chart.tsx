'use client';

import { Area, AreaChart, CartesianGrid, Dot, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { DailyWeight } from '@/lib/interpolate';
import { dateFormatter } from '@/lib/utils';

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const weightFormatter = (value: string) => `${value}kg`;

export function Chart({ weightData }: { weightData: DailyWeight[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={weightData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={dateFormatter}
        />
        <YAxis
          domain={['dataMin - 0.5', 'dataMax + 0.5']}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={weightFormatter}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={dateFormatter}
            />
          }
        />
        <defs>
          <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-weight)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-weight)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="weight"
          type="natural"
          fill="url(#fillWeight)"
          fillOpacity={0.4}
          stroke="var(--color-weight)"
          dot={({ payload, ...props }) => {
            return (
              <Dot
                key={payload.date}
                r={payload.interpolated ? 0 : 5}
                cx={props.cx}
                cy={props.cy}
                stroke={'hsl(var(--chart-1))'}
              />
            );
          }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
