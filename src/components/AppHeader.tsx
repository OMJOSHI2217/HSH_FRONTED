import { LogOut, Menu, UserPlus, RefreshCw, CheckSquare, FolderOpen, LayoutDashboard, Users, Cake, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: string;
}

export const AppHeader = ({ title }: AppHeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'All Student', icon: LayoutDashboard },
    { path: '/students/add', label: 'Add Student', icon: UserPlus },
    { path: '/birthdays', label: 'Birthdays', icon: Cake },
    { path: '/update', label: 'Update', icon: RefreshCw },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/categories', label: 'Categories', icon: FolderOpen },
    { path: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
  ];

  const filteredMenuItems = menuItems.filter(item => item.path !== location.pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 shadow-soft-lg animate-scale-in">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          onClick={logout}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
