'use client';

import * as React from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';
import { useTeams } from '@/hooks/use-teams';
import { useAppStore } from '@/stores/providers/app';
import {
  BookOpen,
  ChartColumnDecreasing,
  Command,
  LifeBuoy,
  LucideIcon,
  MailOpen,
  Send,
  Settings2,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavTeam } from '@/components/nav-team';
import { NavUser } from '@/components/nav-user';

export type NavbarItem = {
  name: string;
  url: string;
  icon: LucideIcon;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useAuth();
  const { data: teams } = useTeams();
  const { teamId } = useAppStore((s) => s);

  const team = React.useMemo(
    () => teams?.find((t) => t.teamId === teamId),
    [teams, teamId],
  );

  const [data, setData] = React.useState<{
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
    navMain: NavbarItem[];
    navSecondary: NavbarItem[];
    navTeam: NavbarItem[];
  }>({
    user: null,
    navMain: [
      {
        name: 'Your Progress',
        url: '/users/$userId',
        icon: ChartColumnDecreasing,
      },
      {
        name: 'Teams',
        url: '/teams',
        icon: BookOpen,
      },
      {
        name: 'Invites',
        url: '/invites',
        icon: MailOpen,
      },
      {
        name: 'Settings',
        url: '#',
        icon: Settings2,
      },
    ],
    navSecondary: [
      {
        name: 'Support',
        url: '#',
        icon: LifeBuoy,
      },
      {
        name: 'Feedback',
        url: '#',
        icon: Send,
      },
    ],
    navTeam: [
      {
        name: 'Team Progress',
        url: '/teams/$teamId',
        icon: ChartColumnDecreasing,
      },
      {
        name: 'Members',
        url: '/teams/$teamId/members',
        icon: Users,
      },
      {
        name: 'Invites',
        url: '/teams/$teamId/invites',
        icon: MailOpen,
      },
      {
        name: 'Settings',
        url: '/teams/$teamId/settings',
        icon: Settings2,
      },
    ],
  });

  React.useEffect(() => {
    if (user) {
      setData((prev_data) => ({
        ...prev_data,
        user: {
          id: user.id,
          name: user.name,
          email: user.email ?? 'hi@cueva.io',
        },
        navMain: prev_data.navMain.map((n) => ({
          ...n,
          url: n.url.startsWith('/users/') ? '/users/' + user.id : n.url,
        })),
      }));
    }
  }, [user]);

  React.useEffect(() => {
    if (teamId) {
      setData((prev_data) => ({
        ...prev_data,
        navTeam: prev_data.navTeam.map((n) => ({
          ...n,
          url: '/teams/' + teamId + '/' + (n.url.split('/')[3] ?? ''),
        })),
      }));
    }
  }, [teamId]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={data.navTeam[0].url}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {team?.team.name}
                  </span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavTeam items={data.navTeam} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
