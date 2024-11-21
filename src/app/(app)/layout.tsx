import Link from 'next/link';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

import { AddMeasurement } from './(add)/add-measurement';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Link className="flex" href="/">
                <div>Weight</div>
                <div className="font-bold">Mates</div>™
              </Link>
            </div>
            <AddMeasurement />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 py-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
