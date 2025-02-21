import { ThemeProvider } from "@/components/theme-provider";
import FinanceDashboard from "./components/finance-dashboard";
import NotesDashboard from "./components/notes-dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotesEditor from "./components/notes-editor";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import TodoList from "./pages/TodoList";
import { Toaster } from "@/components/ui/toaster";
import HabitTracker from "./pages/HabitTracker";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import { HabitsProvider } from "@/contexts/HabitsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/navbar";

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <HabitsProvider>
          <Toaster />
          <AnimatePresence>
            <Router>
              <div className='min-h-screen bg-background'>
                <Navbar />
                <main>
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
                      path='/notes/:id'
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
                    <Route
                      path='/habit-tracker'
                      element={
                        <ProtectedRoute>
                          <HabitTracker />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </Router>
          </AnimatePresence>
        </HabitsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
