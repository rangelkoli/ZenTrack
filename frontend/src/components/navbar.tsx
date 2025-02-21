import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className='border-b'>
      <div className='flex h-16 items-center px-4 container mx-auto'>
        <div className='flex items-center space-x-4'>
          {/* Logo */}
          <Button
            variant='link'
            className='text-xl font-bold'
            onClick={() => navigate("/")}
          >
            Dashboard
          </Button>

          {/* Navigation Links - Only show if authenticated */}
          {isAuthenticated && (
            <div className='hidden md:flex items-center space-x-4'>
              <Button variant='ghost' onClick={() => navigate("/notes")}>
                Notes
              </Button>
              <Button variant='ghost' onClick={() => navigate("/tasks")}>
                Tasks
              </Button>
              <Button
                variant='ghost'
                onClick={() => navigate("/habit-tracker")}
              >
                Habits
              </Button>
              <Button variant='ghost' onClick={() => navigate("/finance")}>
                Finance
              </Button>
            </div>
          )}
        </div>

        <div className='ml-auto flex items-center space-x-4'>
          {isAuthenticated ? (
            <div className='flex items-center space-x-4'>
              <span className='text-sm hidden md:inline-block'>
                Welcome, {user?.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <UserCircle className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
