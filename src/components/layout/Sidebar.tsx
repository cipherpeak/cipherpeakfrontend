import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  Loader2,
  Upload,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  CheckCircle2 as CheckCircleIcon,
  CalendarDays,
  FileSpreadsheet,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: UserCheck, label: 'Clients', path: '/clients' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CalendarDays, label: 'Leave Management', path: '/leave-management' },
    { icon: FileSpreadsheet, label: 'Leave Applications', path: '/leave-applications' },
    { icon: IndianRupee, label: 'Dolla', path: '/dolla' },
    { icon: CheckCircleIcon, label: 'Verification', path: '/verification' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Camera, label: 'Shooted Clips', path: '/camera-team' },
  ];

  const filteredNavItems = navItems.filter((item) => {
    const isAdmin = user === 'admin' || user === 'superuser';

    // Admin-only paths
    const adminOnlyPaths = [
      '/employees',
      '/clients',
      '/dolla',
      '/verification',
      '/reports',
      '/leave-applications'
    ];

    if (adminOnlyPaths.includes(item.path)) {
      return isAdmin;
    }

    if (item.path === '/leave-management') {
      return !isAdmin;
    }

    if (item.path === '/camera-team') {
      return true; // Show for all users including admins
    }

    return true;
  });

  return (
    <div
      className={cn(
        'h-full bg-card border-r border-border transition-all duration-300 relative z-50 overflow-visible',
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
          {filteredNavItems.map((item) => (
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
