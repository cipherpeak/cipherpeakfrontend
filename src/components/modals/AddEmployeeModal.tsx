// components/modals/AddEmployeeModal.tsx
import { useState, useEffect, useRef } from 'react';
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
import {
  CalendarIcon,
  Loader2,
  Upload,
  User,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axiosInstance from '@/axios/axios';

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
  profile_image?: string;
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
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

        // Set profile image preview if exists
        if (employeeToEdit.profile_image) {
          setProfileImagePreview(employeeToEdit.profile_image);
        }
      } else {
        // Reset form for adding new employee
        resetForm();
      }
    }
  }, [open, employeeToEdit, mode]);

  const handleFileSelect = (file: File) => {
    if (file) {
      console.log("Selected file:", file);

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }

      setError(null);

      // Set the profile image FIRST
      console.log("Setting profileImage state to:", file);
      setProfileImage(file);

      // Then create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log("FileReader result ready, setting preview");
        setProfileImagePreview(result);
      };
      reader.onerror = () => {
        console.error("FileReader error");
        setError('Failed to read the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    console.log("Files dropped:", files);
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  console.log(profileImage);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(10);

    const submissionData = new FormData();

    // Append text fields
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== null && value !== undefined && value !== '') {
        submissionData.append(key, value as string);
      }
    });

    // Append dates if selected
    if (joinDate) {
      submissionData.append('joining_date', format(joinDate, 'yyyy-MM-dd'));
    }
    if (dobDate) {
      submissionData.append('date_of_birth', format(dobDate, 'yyyy-MM-dd'));
    }

    // Append profile image if selected
    if (profileImage) {
      submissionData.append('profile_image', profileImage);
    }

    // Append role explicitly if needed
    if (formData.role) {
      submissionData.append('role', formData.role);
    }

    try {
      setUploadProgress(50);
      let response;

      if (mode === 'edit' && employeeToEdit) {
        // Update existing employee
        response = await axiosInstance.patch(`auth/employees/${employeeToEdit.id}/update/`, submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(percentCompleted);
          },
        });
        toast.success("Employee updated successfully");
        if (onEmployeeUpdated) onEmployeeUpdated();
      } else {
        // Create new employee
        response = await axiosInstance.post('auth/employees/create/', submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(percentCompleted);
          },
        });
        toast.success("Employee created successfully");
        onEmployeeAdded();
      }

      setUploadProgress(100);
      onOpenChange(false);
      resetForm();

    } catch (err: any) {
      console.error("Error submitting form:", err);
      // Extract error message from API response
      let errorMessage = "Failed to save employee. Please try again.";

      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (typeof err.response.data === 'object') {
          // If it's a field error map, take the first one
          const firstError = Object.values(err.response.data)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0] as string;
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
    setProfileImage(null);
    setProfileImagePreview('');
    setError(null);
    setUploadProgress(0);
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
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {mode === 'edit'
                  ? 'Update employee information and details.'
                  : 'Add a new team member to your organization with their complete details.'
                }
              </DialogDescription>
            </div>
            {mode === 'edit' && employeeToEdit && (
              <Badge
                variant={
                  employeeToEdit.current_status === 'active' ? 'default' :
                    employeeToEdit.current_status === 'on_leave' ? 'secondary' :
                      'outline'
                }
                className="capitalize"
              >
                {employeeToEdit.current_status.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mx-6 mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading profile image...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Profile Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground">
                Profile Image
              </Label>
              <span className="text-xs text-muted-foreground">
                Optional • Max 5MB
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 overflow-hidden group">
                  {profileImagePreview ? (
                    <>
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div className="flex-1">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/50 hover:bg-primary/3",
                    profileImagePreview && "bg-success/5 border-success/30"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      console.log("File input changed:", e.target.files);
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors",
                      profileImagePreview
                        ? "bg-success/20 text-success"
                        : "bg-primary/10 text-primary"
                    )}>
                      {profileImagePreview ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {profileImagePreview ? 'Image Selected' : 'Upload Profile Image'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profileImagePreview
                          ? 'Click or drag to change the image'
                          : 'Drag & drop or click to browse'
                        }
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP • Max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Personal Information
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username *
                </Label>
                <Input
                  id="username"
                  placeholder="Enter username..."
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={mode === 'edit'}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  placeholder="Enter first name..."
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  placeholder="Enter last name..."
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="phone_number" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="h-11">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !dobDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4" />
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
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Address Information
            </h4>

            <div className="space-y-3">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter full address..."
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-3">
                <Label htmlFor="city" className="text-sm font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="state" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="postal_code" className="text-sm font-medium">
                  Postal Code
                </Label>
                <Input
                  id="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Emergency Contact
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                  Contact Name
                </Label>
                <Input
                  id="emergency_contact_name"
                  placeholder="Emergency contact name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                  Contact Phone
                </Label>
                <Input
                  id="emergency_contact_phone"
                  placeholder="Emergency contact phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="emergency_contact_relation" className="text-sm font-medium">
                Relationship
              </Label>
              <Input
                id="emergency_contact_relation"
                placeholder="Relationship with employee"
                value={formData.emergency_contact_relation}
                onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Employment Information
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="employee_id" className="text-sm font-medium">
                  Employee ID
                </Label>
                <Input
                  id="employee_id"
                  placeholder="EMP-001"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className="h-11">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className="h-11">
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

              <div className="space-y-3">
                <Label htmlFor="designation" className="text-sm font-medium">
                  Designation
                </Label>
                <Input
                  id="designation"
                  placeholder="Job title/position"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="salary" className="text-sm font-medium">
                  Salary
                </Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="current_status" className="text-sm font-medium">
                  Status *
                </Label>
                <Select
                  value={formData.current_status}
                  onValueChange={(value) => handleInputChange('current_status', value)}
                >
                  <SelectTrigger className="h-11">
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Joining Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !joinDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4" />
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

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-32 h-11"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-40 h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Adding...'}
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
