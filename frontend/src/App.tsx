import { ThemeProvider } from "@/components/theme-provider";
import FinanceDashboard from "./components/finance-dashboard";
import NotesDashboard from "./components/notes-dashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NotesEditor from "./components/notes-editor";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import TodoList from "./pages/TodoList";
import TasksPage from "./pages/TasksPage"; // Import the new TasksPage
import { Toaster } from "@/components/ui/toaster";
import HabitTracker from "./pages/HabitTracker";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext"; // Import TaskProvider
import { HabitProvider } from "@/contexts/HabitContext"; // Use the correct import
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/navbar";

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='app-theme'>
      <AuthProvider>
        <TaskProvider>
          <HabitProvider>
            {" "}
            {/* Use the correct provider name */}
            <Toaster />
            <AnimatePresence>
              <Router>
                <div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
                  {/* Fix: Add pointer-events-none to background element but keep content clickable */}
                  <div className='absolute inset-0 pointer-events-none'>
                    <div className='absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]'></div>
                  </div>
                  <Navbar />
                  <main className='container mx-auto p-4'>
                    <Routes>
                      {/* Public Routes */}
                      <Route path='/login' element={<LoginPage />} />
                      <Route path='/signup' element={<SignUpPage />} />
                      <Route path='/landing' element={<LandingPage />} />
                      <Route path='/' element={<LandingPage />} />

                      {/* Protected Routes */}
                      <Route
                        path='/dashboard'
                        element={
                          <ProtectedRoute>
                            <Home />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path='/notes'
                        element={
                          <ProtectedRoute>
                            <NotesDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path='/finance'
                        element={
                          <ProtectedRoute>
                            <FinanceDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path='/notes/:uuid'
                        element={
                          <ProtectedRoute>
                            <NotesEditor />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path='/tasks'
                        element={
                          <ProtectedRoute>
                            <TodoList />
                          </ProtectedRoute>
                        }
                      />
                      {/* New TasksPage route */}
                      <Route
                        path='/smart-tasks'
                        element={
                          <ProtectedRoute>
                            <TasksPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path='/habit-tracker'
                        element={
                          <ProtectedRoute>
                            <HabitTracker />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch-all route - redirects to landing page for undefined routes */}
                      <Route path='*' element={<Navigate to='/' replace />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </AnimatePresence>
          </HabitProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
