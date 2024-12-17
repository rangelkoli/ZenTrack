import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import FinanceDashboard from "./components/finance-dashboard";
import NotesDashboard from "./components/notes-dashboard";
import { BrowserRouter, Routes, Route } from "react-router";
import NotesEditor from "./components/notes-editor";

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className=''>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className='sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-900 px-4 z-50'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              {/* <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>October 2024</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
            </header>
            <BrowserRouter>
              <Routes>
                <Route path='/notes' element={<NotesDashboard />} />
                <Route path='/finance' element={<FinanceDashboard />} />
                <Route path='/notes/:id' element={<NotesEditor />} />
              </Routes>
            </BrowserRouter>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
