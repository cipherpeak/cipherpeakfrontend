import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Building,
  CheckCircle2,
  FileText as FileTextIcon
} from 'lucide-react';

interface Employee {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: string;
  current_status: string;
  department: string | null;
  designation: string | null;
  employee_id: string | null;
  joining_date: string;
  salary?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  created_at?: string;
  updated_at?: string;
  profile_image?: string;
  profile_image_url?: string;
}

interface EmployeeProfileCardProps {
  employee: Employee;
  onViewDetails: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: number) => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({
  employee,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const getFullName = (emp: Employee) => {
    return `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.username;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'on_leave':
      case 'on leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'probation_period': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      case 'notice_period': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden border-8 border-white hover:shadow-xl transition-all duration-300 group relative h-[30rem]">
      {/* Background Image Section - Full Height */}
      <div className="absolute inset-0 z-0">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage
            src={employee.profile_image_url || "/placeholder-avatar.jpg"}
            alt={getFullName(employee)}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-none w-full h-full flex items-center justify-center">
            {getInitials(employee.first_name, employee.last_name)}
          </AvatarFallback>
        </Avatar>

        {/* Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Top Action Buttons - Absolute positioned */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        {/* Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border-white/20">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onViewDetails(employee)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(employee.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <Badge variant="outline" className={`${getStatusColor(employee.current_status)} border-white/30 backdrop-blur-sm`}>
          {formatStatus(employee.current_status)}
        </Badge>
      </div>

      {/* Bottom Content Area with Blur */}
      <div className="absolute bottom-0 left-0 right-0 z-10 ">
        <div className="backdrop-blur-[3px] rounded- p-6">
          {/* Employee Information */}
          <div className="space-y-4 text-white">
            {/* Name and Role */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white truncate drop-shadow-lg">
                  {getFullName(employee)}
                </h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed truncate drop-shadow-lg">
                {employee.designation || employee.role}
              </p>
            </div>

            {/* Department and Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-lg">
                <Building className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.department || 'No Department'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-lg">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone_number && (
                <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-lg">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{employee.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
