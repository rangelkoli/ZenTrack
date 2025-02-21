import { ThemeProvider } from "@/components/theme-provider";
import FinanceDashboard from "./components/finance-dashboard";
import NotesDashboard from "./components/notes-dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotesEditor from "./components/notes-editor";
// import {
//   CommandDialog,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
//   CommandShortcut,
// } from "@/components/ui/command";
import React from "react";
// import {
//   Calculator,
//   Calendar,
//   CreditCard,
//   Settings,
//   Smile,
//   User,
// } from "lucide-react";
import LoginPage from "./pages/Login";
import useUserStore from "./stores/user";

import SignUpPage from "./pages/Signup";
// import useNotesContent from "./stores/notesContent";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import TodoList from "./pages/TodoList";
import { Toaster } from "@/components/ui/toaster";
import HabitTracker from "./pages/HabitTracker";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import { HabitsProvider } from "@/contexts/HabitsContext";

function App() {
  const isLoggedIn = useUserStore((state) => state.user.isLoggedIn);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
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

  // const title = useNotesContent((state) => state.title);
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <HabitsProvider>
        <Toaster />
        <AnimatePresence>
          {isLoggedIn ? (
            <div className=' dark:bg-slate-900 text-black dark:text-white min-h-screen'>
              <main className=''>
                <Router>
                  <Routes>
                    <Route path='/notes' element={<NotesDashboard />} />
                    <Route path='/finance' element={<FinanceDashboard />} />
                    <Route path='/notes/:id' element={<NotesEditor />} />
                    <Route path='/' element={<Home />} />
                    <Route path='/tasks' element={<TodoList />} />
                    <Route path='/habit-tracker' element={<HabitTracker />} />
                    <Route path='/landing' element={<LandingPage />} />
                  </Routes>
                </Router>
              </main>
            </div>
          ) : (
            <div className='min-h-screen bg-background'>
              <Router>
                <Routes>
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='/signup' element={<SignUpPage />} />
                  <Route path='/*' element={<LandingPage />} />
                </Routes>
              </Router>
            </div>
          )}
        </AnimatePresence>
      </HabitsProvider>
    </ThemeProvider>
  );
}

export default App;
