import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  IndianRupee, // Added DollarSign icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: UserCheck, label: 'Clients', path: '/clients' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: IndianRupee, label: 'Dolla', path: '/dolla' }, 
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div
      className={cn(
        'h-full bg-card border-r border-border transition-all duration-300 relative',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-card hover:bg-muted z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="mt-8 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-[#4D4D4D] hover:bg-[#4D4D4D] hover:text-[#ffff] text-white'
                      : 'text-muted-foreground',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )
                }
              >
                <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;