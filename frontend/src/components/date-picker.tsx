import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function DatePicker() {
  return (
    <SidebarGroup className='px-0'>
      <SidebarGroupContent>
        <Calendar
          className='
                        [&_[role=gridcell].bg-accent]:bg-sidebar-primary 
                        [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground 
                        [&_[role=gridcell]]:w-[33px]
                        dark:[&_[role=gridcell].bg-accent]:bg-sidebar-primary-dark
                        dark:[&_[role=gridcell].bg-accent]:text-sidebar-primary-dark-foreground
                        dark:[&_[role=gridcell]]:text-gray-300
                        dark:[&_[role=button]]:text-gray-300
                        dark:[&_.rdp-day_not-month]:text-gray-600
                        dark:[&_.rdp-day_today]:bg-gray-800
                        dark:[&_.rdp-day_selected]:bg-sidebar-primary-dark
                        dark:[&_.rdp-day_selected]:text-sidebar-primary-dark-foreground
                        dark:[&_.rdp-head_cell]:text-gray-400
                        dark:[&_.rdp-day_name]:text-gray-100 // Added this line
                        dark:bg-gray-900
                    '
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
