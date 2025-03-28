import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserCircle, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className='border-b sticky top-0 z-50 bg-background'>
      <div className='flex h-16 items-center px-4 container mx-auto'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='link'
            className='text-xl font-bold'
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          >
            Dashboard
          </Button>

          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <div className='hidden md:flex items-center space-x-4'>
                <Button variant='ghost' onClick={() => navigate("/notes")}>
                  Notes
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => navigate("/habit-tracker")}
                >
                  Habits
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => navigate("/smart-tasks")}
                >
                  Smart Tasks
                </Button>
                <Button variant='ghost' onClick={() => navigate("/finance")}>
                  Finance
                </Button>
              </div>

              {/* Mobile Navigation Toggle */}
              <div className='md:hidden'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label='Toggle menu'
                >
                  {isMenuOpen ? (
                    <X className='h-5 w-5' />
                  ) : (
                    <Menu className='h-5 w-5' />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className='ml-auto flex items-center space-x-4'>
          <ThemeToggle />
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
              <Link to='/login'>
                <Button variant='ghost'>Login</Button>
              </Link>
              <Link to='/signup'>
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu - Expands below header */}
      {isAuthenticated && isMenuOpen && (
        <div className='md:hidden bg-background border-b px-4 py-2 animate-in fade-in slide-in-from-top duration-300'>
          <div className='flex flex-col space-y-2'>
            <Button
              variant='ghost'
              className='justify-start'
              onClick={() => handleNavigation("/notes")}
            >
              Notes
            </Button>
            <Button
              variant='ghost'
              className='justify-start'
              onClick={() => handleNavigation("/habit-tracker")}
            >
              Habits
            </Button>
            <Button
              variant='ghost'
              className='justify-start'
              onClick={() => handleNavigation("/smart-tasks")}
            >
              Smart Tasks
            </Button>
            <Button
              variant='ghost'
              className='justify-start'
              onClick={() => handleNavigation("/finance")}
            >
              Finance
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
