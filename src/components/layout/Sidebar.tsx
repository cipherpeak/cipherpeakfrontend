import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/Redux/Store';
import { updateUserInfo } from '@/Redux/slices/authSlice';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
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
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFullProfile = async () => {
      // If we have userInfo but it's missing critical fields, fetch full list and find self
      if (userInfo?.id && (!userInfo?.department || !userInfo?.designation)) {
        try {
          const response = await axiosInstance.get(requests.EmployeeList);
          const employees = Array.isArray(response.data) ? response.data : (response.data.employees || []);
          const me = employees.find((emp: any) => emp.id === userInfo.id);
          if (me) {

            dispatch(updateUserInfo(me));
          }
        } catch (error) {
          console.error('Sidebar: Failed to fetch profile fallback:', error);
        }
      }
    };

    fetchFullProfile();
  }, [userInfo?.id, dispatch]);



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
    const isAdmin = user === 'admin' || user === 'superuser' || (user && typeof user === 'object' && (user.is_superuser || ['admin', 'superuser'].includes(user.role)));
    const role = typeof user === 'string' ? user : user?.role;
    const userType = userInfo?.user_type;

    // Mapping of paths to allowed roles/userTypes
    switch (item.path) {
      case '/employees':
      case '/clients':
      case '/dolla':
      case '/verification':
      case '/reports':
        return isAdmin;

      case '/leave-applications':
        return isAdmin || ['hr', 'manager'].includes(userType);

      case '/leave-management':
        return !isAdmin;

      case '/camera-team':
        return (
          isAdmin ||
          ['camera_department', 'content_creator', 'editor', 'manager', 'hr'].includes(userType)
        );

      case '/': // Dashboard
      case '/tasks':
      case '/calendar':
      case '/profile':
        return true;

      default:
        return true;
    }
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
                title={`${item.label} (Role: ${user}, Dept: ${userInfo?.department}, Desig: ${userInfo?.designation})`}
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
