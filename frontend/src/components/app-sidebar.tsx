import * as React from "react";
import { SquareTerminal, Map, Frame, PieChart } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import useUserStore from "@/stores/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { NavProjects } from "./nav-projects";
import { SidebarTrigger } from "@/components/ui/sidebar";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state) => state.user);

  const data = {
    navMain: [
      {
        title: "Recent Notes",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Folders",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Habits",
        url: "/habits",
        icon: Frame,
      },
      {
        name: "Finances",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Journal",
        url: "#",
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar
      {...props}
      collapsible='icon'
      variant='inset'
      className='bg-white dark:bg-slate-900'
    >
      <SidebarHeader className='h-16 '>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />

        {/* <SidebarMenu>
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
            <SidebarMenuButton onClick={() => {}}>Finance</SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                window.location.href = "/notes";
              }}
            >
              Notes
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => {}}>Habits</SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
              }}
            >
              Journal
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarSeparator className='mx-0' />
      </SidebarContent>
      <SidebarFooter>
        <div className='flex justify-center'>
          <SidebarTrigger className-='-ml-1' />
        </div>

        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
