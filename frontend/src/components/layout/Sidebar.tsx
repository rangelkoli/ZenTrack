import { Link, useLocation } from "react-router-dom";
import { Home, CheckSquare, BarChart2, FileText, Settings } from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className='h-5 w-5' /> },
    {
      path: "/tasks",
      label: "Tasks",
      icon: <CheckSquare className='h-5 w-5' />,
    },
    {
      path: "/habits",
      label: "Habits",
      icon: <BarChart2 className='h-5 w-5' />,
    },
    { path: "/notes", label: "Notes", icon: <FileText className='h-5 w-5' /> },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className='h-5 w-5' />,
    },
  ];

  return (
    <aside className='w-64 bg-white border-r border-gray-200 h-screen sticky top-0'>
      <div className='p-6'>
        <h1 className='text-xl font-bold'>Personal Dashboard</h1>
      </div>
      <nav className='mt-6'>
        <ul className='space-y-2 px-4'>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className='ml-3'>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
