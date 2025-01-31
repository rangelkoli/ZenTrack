import * as React from "react";
import { Home } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import useUserStore from "@/stores/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state) => state.user);
  return (
    <Sidebar {...props}>
      <SidebarHeader className='h-16 border-b border-sidebar-border dark:border-slate-800 dark:bg-slate-900'>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator className='mx-0' />
        {/* <Calendars calendars={data.calendars} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <Home size={20} />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator className='mx-0' />

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                /* handle Finance button click */
              }}
            >
              Finance
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                /* handle Notes button click */
                window.location.href = "/notes";
              }}
            >
              Notes
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                /* handle Habits button click */
              }}
            >
              Habits
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                /* handle Journal button click */
              }}
            >
              Journal
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className='mx-0' />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
