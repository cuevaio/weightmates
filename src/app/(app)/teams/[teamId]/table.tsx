import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import { MeasurementSelect, UserSelect } from '@/db/schema';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { dateFormatter } from '@/lib/utils';

import { ClientWrapper } from './client';

const SingleMemberRow = ({
  member,
}: {
  member: UserSelect & {
    measurements: MeasurementSelect[];
  };
}) => {
  if (member.measurements.length < 2) {
    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border text-xs font-black">
              {member.name[0].toUpperCase()}
            </div>
            <div>{member.name}</div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  const initialMeasurement =
    member.measurements[member.measurements.length - 1];
  const lastMeasurement = member.measurements[0];
  const penultimateMeasurement = member.measurements[1];

  const currentLossDays =
    (new Date(lastMeasurement.measuredAt).getTime() -
      new Date(penultimateMeasurement.measuredAt).getTime()) /
    1000 /
    3600 /
    24;

  const currentLossRate =
    ((lastMeasurement.weight - penultimateMeasurement.weight) /
      currentLossDays) *
    7;

  const currentLossRatePercentage =
    (lastMeasurement.weight / penultimateMeasurement.weight) **
      (7 / currentLossDays) -
    1;

  const globalLossDays =
    (new Date(lastMeasurement.measuredAt).getTime() -
      new Date(initialMeasurement.measuredAt).getTime()) /
    1000 /
    3600 /
    24;

  const globalLossRate =
    ((lastMeasurement.weight - initialMeasurement.weight) / globalLossDays) * 7;

  const globalLossRatePercentage =
    (lastMeasurement.weight / initialMeasurement.weight) **
      (7 / currentLossDays) -
    1;

  const globalLoss = lastMeasurement.weight - initialMeasurement.weight;
  const globalLossPercentage = globalLoss / initialMeasurement.weight;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full border text-xs font-black">
            {member.name[0].toUpperCase()}
          </div>
          <div>{member.name}</div>
        </div>
      </TableCell>
      <TableCell className="tabular-nums">
        {(Math.round(initialMeasurement.weight * 100) / 100).toFixed(2)}kg
      </TableCell>
      <TableCell className="tabular-nums">
        {(Math.round(lastMeasurement.weight * 100) / 100).toFixed(2)}kg
      </TableCell>
      <TableCell
        className="tabular-nums data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
        data-increasing={currentLossRate > 0}
      >
        <span className="group-data-[percentage='true']:hidden">
          {Math.abs(Math.round(currentLossRate * 100) / 100).toFixed(2)}kg
        </span>
        <span className="group-data-[percentage='false']:hidden">
          {Math.abs(
            Math.round(currentLossRatePercentage * 10000) / 100,
          ).toFixed(2)}
          %
        </span>
        {currentLossRate > 0 ? (
          <TrendingUpIcon className="inline-flex size-4" />
        ) : (
          <TrendingDownIcon className="inline-flex size-4" />
        )}{' '}
        <span className="text-[0.5rem] text-xs font-bold">per week</span>
      </TableCell>
      <TableCell
        className="tabular-nums data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
        data-increasing={globalLossRate > 0}
      >
        <span className="group-data-[percentage='true']:hidden">
          {Math.abs(Math.round(globalLossRate * 100) / 100).toFixed(2)}kg
        </span>
        <span className="group-data-[percentage='false']:hidden">
          {Math.abs(Math.round(globalLossRatePercentage * 10000) / 100).toFixed(
            2,
          )}
          %
        </span>
        {globalLossRate > 0 ? (
          <TrendingUpIcon className="inline-flex size-4" />
        ) : (
          <TrendingDownIcon className="inline-flex size-4" />
        )}{' '}
        <span className="text-[0.5rem] text-xs font-bold">per week</span>
      </TableCell>

      <TableCell
        className="tabular-nums data-[increasing=false]:text-green-500 data-[increasing=true]:text-red-500"
        data-increasing={globalLoss > 0}
      >
        <span className="group-data-[percentage='true']:hidden">
          {Math.abs(Math.round(globalLoss * 100) / 100).toFixed(2)}kg
        </span>
        <span className="group-data-[percentage='false']:hidden">
          {Math.abs(Math.round(globalLossPercentage * 10000) / 100).toFixed(2)}%
        </span>

        {globalLoss > 0 ? (
          <TrendingUpIcon className="inline-flex size-4" />
        ) : (
          <TrendingDownIcon className="inline-flex size-4" />
        )}
      </TableCell>
      <TableCell className="text-right">
        {dateFormatter(lastMeasurement.measuredAt)}
      </TableCell>
    </TableRow>
  );
};

export const MembersTable = ({
  members,
}: {
  members: (UserSelect & {
    measurements: MeasurementSelect[];
  })[];
}) => {
  return (
    <ClientWrapper>
      <Table className="text-xs sm:text-base">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Initial Weight</TableHead>
            <TableHead>Current Weight</TableHead>

            <TableHead>Current Loss Rate</TableHead>
            <TableHead>Global Loss Rate</TableHead>

            <TableHead>Global Loss</TableHead>

            <TableHead className="text-right">Last measured at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <SingleMemberRow key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>
    </ClientWrapper>
  );
};
