import { LogOut, Menu, UserPlus, RefreshCw, CheckSquare, FolderOpen, LayoutDashboard, Users, Cake, MessageCircle, BookOpen } from 'lucide-react';
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
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const filteredMenuItems = menuItems.filter(item => item.path !== location.pathname);

  return (
    <header className="sticky top-0 z-40 glass-header shadow-soft">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto relative">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-xl"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 glass-card shadow-soft-lg animate-scale-in border-white/40">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-primary/10"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-14 sm:h-16 w-auto object-contain cursor-pointer transition-transform hover:scale-110 active:scale-90"
            onClick={() => navigate('/dashboard')}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl z-10"
          onClick={logout}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
