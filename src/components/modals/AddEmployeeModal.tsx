// components/modals/AddEmployeeModal.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';

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
}

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
  onEmployeeUpdated?: () => void;
  employeeToEdit?: Employee | null;
  mode?: 'add' | 'edit';
}

const AddEmployeeModal = ({ 
  open, 
  onOpenChange, 
  onEmployeeAdded, 
  onEmployeeUpdated,
  employeeToEdit,
  mode = 'add'
}: AddEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    // Personal Information
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Employment Information
    employee_id: '',
    role: 'employee',
    department: '',
    designation: '',
    salary: '',
    current_status: 'active',
    joining_date: '',
  });
  
  const [joinDate, setJoinDate] = useState<Date>();
  const [dobDate, setDobDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Role options based on your Django model
  const roleOptions = [
    { value: 'director', label: 'Director' },
    { value: 'managing_director', label: 'Managing Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'employee', label: 'Employee' },
  ];

  // Status options based on your Django model
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'probation_period', label: 'Probation Period' },
    { value: 'notice_period', label: 'Notice Period' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Department options
  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'IT',
    'Customer Support',
  ];

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  // Reset form when modal opens/closes or employeeToEdit changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && employeeToEdit) {
        // Pre-fill form with employee data for editing
        setFormData({
          username: employeeToEdit.username || '',
          email: employeeToEdit.email || '',
          first_name: employeeToEdit.first_name || '',
          last_name: employeeToEdit.last_name || '',
          phone_number: employeeToEdit.phone_number || '',
          date_of_birth: employeeToEdit.date_of_birth || '',
          gender: employeeToEdit.gender || '',
          address: employeeToEdit.address || '',
          city: employeeToEdit.city || '',
          state: employeeToEdit.state || '',
          postal_code: employeeToEdit.postal_code || '',
          country: employeeToEdit.country || '',
          emergency_contact_name: employeeToEdit.emergency_contact_name || '',
          emergency_contact_phone: employeeToEdit.emergency_contact_phone || '',
          emergency_contact_relation: employeeToEdit.emergency_contact_relation || '',
          employee_id: employeeToEdit.employee_id || '',
          role: employeeToEdit.role || 'employee',
          department: employeeToEdit.department || '',
          designation: employeeToEdit.designation || '',
          salary: employeeToEdit.salary || '',
          current_status: employeeToEdit.current_status || 'active',
          joining_date: employeeToEdit.joining_date || '',
        });

        // Set dates
        if (employeeToEdit.joining_date) {
          setJoinDate(new Date(employeeToEdit.joining_date));
        }
        if (employeeToEdit.date_of_birth) {
          setDobDate(new Date(employeeToEdit.date_of_birth));
        }
      } else {
        // Reset form for adding new employee
        resetForm();
      }
    }
  }, [open, employeeToEdit, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the data for API
      const submitData = {
        ...formData,
        joining_date: joinDate ? format(joinDate, 'yyyy-MM-dd') : '',
        date_of_birth: dobDate ? format(dobDate, 'yyyy-MM-dd') : '',
        // Convert empty strings to null for optional fields
        phone_number: formData.phone_number || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        department: formData.department || null,
        designation: formData.designation || null,
        employee_id: formData.employee_id || null,
        gender: formData.gender || null,
      };

      if (mode === 'edit' && employeeToEdit) {
        // Update existing employee
        const response = await axiosInstance.put(`${requests.UpdateEmployees}${employeeToEdit.id}/update/`, submitData);
        console.log('Employee updated:', response.data);
        
        // Reset form and close modal
        resetForm();
        
        // Call update callback
        if (onEmployeeUpdated) {
          onEmployeeUpdated();
        }
        onOpenChange(false);
      } else {
        // Create new employee
        const response = await axiosInstance.post(`${requests.CreateEmployees}`, submitData);
        console.log('Employee created:', response.data);
        
        // Reset form and close modal
        resetForm();
        
        // Call add callback
        onEmployeeAdded();
        onOpenChange(false);
      }
      
    } catch (err: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} employee:`, err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        `Failed to ${mode === 'edit' ? 'update' : 'create'} employee. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      employee_id: '',
      role: 'employee',
      department: '',
      designation: '',
      salary: '',
      current_status: 'active',
      joining_date: '',
    });
    setJoinDate(undefined);
    setDobDate(undefined);
    setError(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update employee information and details.'
              : 'Add a new team member to your organization with their complete details.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
              Personal Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Enter username..."
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={mode === 'edit'} // Username cannot be changed in edit mode
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="Enter first name..."
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Enter last name..."
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dobDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dobDate ? format(dobDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={setDobDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
              Address Information
            </h4>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter full address..."
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
              Emergency Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  placeholder="Emergency contact name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  placeholder="Emergency contact phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relation">Relationship</Label>
              <Input
                id="emergency_contact_relation"
                placeholder="Relationship with employee"
                value={formData.emergency_contact_relation}
                onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
              Employment Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  placeholder="EMP-001"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="Job title/position"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_status">Status *</Label>
                <Select
                  value={formData.current_status}
                  onValueChange={(value) => handleInputChange('current_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !joinDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {joinDate ? format(joinDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joinDate}
                    onSelect={setJoinDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Adding Employee...'}
                </>
              ) : (
                mode === 'edit' ? 'Update Employee' : 'Add Employee'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;