import { AppSidebar } from "@/components/app-sidebar";

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
// import NotesEditor from "./components/notes-editor";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";
import LoginPage from "./pages/Login";
import useUserStore from "./stores/user";
import { Input } from "./components/ui/input";
import { Search } from "lucide-react";
import SignUpPage from "./pages/Signup";
import useNotesContent from "./stores/notesContent";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import TodoList from "./pages/TodoList";
import { Toaster } from "@/components/ui/toaster";
import HabitTracker from "./pages/HabitTracker";

function App() {
  const [open, setOpen] = React.useState(false);

  const isLoggedIn = useUserStore((state) => state.user.isLoggedIn);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // useEffect(() => {
  //   const accessToken = localStorage.getItem("access_token");

  //   if (accessToken) {
  //     const response = axios
  //       .post(
  //         "http://127.0.0.1:5000/auth/get_user",
  //         {
  //           access_token: accessToken,
  //         },

  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${accessToken}`, // Include JWT in the header
  //           },
  //         }
  //       )
  //       .then((res) => {
  //         console.log(res);
  //         useUserStore.setState({
  //           user: { isLoggedIn: true, details: res.data },
  //         });
  //       });
  //   }
  // }, []);

  const title = useNotesContent((state) => state.title);
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Toaster />

      {isLoggedIn ? (
        <div className=''>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='w-screen overflow-hidden'>
              <header className='sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-900 px-4 z-50'>
                <SidebarTrigger className-='-ml-1' />
                <Separator orientation='vertical' className='mr-2 h-4' />
                {/* <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>October 2024</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb> */}
                {title ? (
                  <div>
                    <h1 className='text-lg font-semibold'>{title}</h1>
                  </div>
                ) : (
                  <div className='relative w-full'>
                    <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='Search books here'
                      className='w-full pl-8'
                    />
                  </div>
                )}
              </header>
              <BrowserRouter>
                <Routes>
                  <Route path='/notes' element={<NotesDashboard />} />
                  <Route path='/finance' element={<FinanceDashboard />} />
                  {/* <Route path='/notes/:id' element={<NotesEditor />} /> */}
                  <Route path='/' element={<Home />} />
                  <Route path='/tasks' element={<TodoList />} />
                  <Route path='/habit-tracker' element={<HabitTracker />} />
                </Routes>
              </BrowserRouter>
              <div className=' '>
                <CommandDialog open={open} onOpenChange={setOpen}>
                  <CommandInput
                    placeholder='Type a command or search...'
                    className=''
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading='Suggestions'>
                      <CommandItem>
                        <Calendar />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem>
                        <Smile />
                        <span>Search Emoji</span>
                      </CommandItem>
                      <CommandItem>
                        <Calculator />
                        <span>Calculator</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading='Settings'>
                      <CommandItem>
                        <User />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <CreditCard />
                        <span>Billing</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Settings />
                      </CommandItem>
                      <span>Settings</span>
                      <CommandShortcut>⌘S</CommandShortcut>
                    </CommandGroup>
                  </CommandList>
                </CommandDialog>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      ) : (
        <div className='bg-background h-screen flex items-center justify-center w-screen'>
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/signup' element={<SignUpPage />} />
              <Route path='/' element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;
