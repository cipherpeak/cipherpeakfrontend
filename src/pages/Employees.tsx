import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Edit, 
  Loader2,
  User,
  Calendar,
  MapPin,
  IndianRupee,
  FileText,
  Image,
  Download,
  Building,
  IdCard,
  Shield,
  Award,
  Briefcase,
  Contact,
  FileText as FileTextIcon
} from 'lucide-react';

import AddEmployeeModal from '@/components/modals/AddEmployeeModal';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';
import { EmployeeProfileCard } from '@/components/pagesComponent/EmployeesCom/EmployeeProfileCard';

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

interface EmployeeDocument {
  id: number;
  document_type: string;
  title: string;
  description: string;
  file: string;
  file_url: string;
  uploaded_at: string;
  is_verified: boolean;
}

interface EmployeeMedia {
  id: number;
  media_type: string;
  title: string;
  description: string;
  file: string;
  file_url: string;
  uploaded_at: string;
}

interface EmployeeDetails extends Employee {
  documents: EmployeeDocument[];
  media_files: EmployeeMedia[];
  leave_records: any[];
  salary_history: any[];
}

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

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${requests.FetchEmployees}`);
      setEmployees(response.data.employees || response.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.error || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  console.log(employees,"this is emply");
  
  // Fetch employee details
  const fetchEmployeeDetails = async (employeeId: number) => {
    try {
      setDetailLoading(true);
      const response = await axiosInstance.get(`${requests.FetchEmployees}${employeeId}/`);
      setSelectedEmployee(response.data);
      setActiveTab('details');
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      alert('Failed to load employee details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    fetchEmployeeDetails(employee.id);
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedEmployee(null);
  };

  // Function to handle edit button click
  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setModalMode('edit');
    setIsAddEmployeeModalOpen(true);
  };

  // Function to handle add employee button click
  const handleAddEmployee = () => {
    setEmployeeToEdit(null);
    setModalMode('add');
    setIsAddEmployeeModalOpen(true);
  };

  // Function to handle employee update
  const handleEmployeeUpdated = () => {
    fetchEmployees(); // Refresh the employee list
    if (selectedEmployee && employeeToEdit && selectedEmployee.id === employeeToEdit.id) {
      // If we're viewing the employee that was just updated, refresh the details
      fetchEmployeeDetails(employeeToEdit.id);
    }
  };

  // Update the modal close handler
  const handleModalClose = () => {
    setIsAddEmployeeModalOpen(false);
    setEmployeeToEdit(null);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFullName = (employee: Employee) => {
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.username;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/employees/${employeeId}/delete/`);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      if (selectedEmployee?.id === employeeId) {
        handleBackToList();
      }
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee');
    }
  };

  const handleEmployeeAdded = () => {
    fetchEmployees();
    setIsAddEmployeeModalOpen(false);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) => (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-4">Error: {error}</div>
          <Button onClick={fetchEmployees}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and their information
            </p>
          </div>
          {activeTab === 'list' && (
            <Button 
              className="flex items-center gap-2"
              onClick={handleAddEmployee}
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          )}
          {activeTab === 'details' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBackToList}>
                Back to List
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => selectedEmployee && handleEditEmployee(selectedEmployee)}
              >
                <Edit className="h-4 w-4" />
                Edit Employee
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Employee List View */}
          <TabsContent value="list" className="space-y-6 mt-0">
            {/* Search and Filters */}
            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search employees by name, email, department, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredEmployees.length} employees
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Grid with New Profile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map((employee) => (
                <EmployeeProfileCard
                  key={employee.id}
                  employee={employee}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                />
              ))}
            </div>

            {/* Empty States */}
            {filteredEmployees.length === 0 && employees.length > 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No employees found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {employees.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No employees yet</p>
                    <p className="text-sm mb-4">Get started by adding your first employee</p>
                    <Button onClick={handleAddEmployee}>
                      Add Employee
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employee Detail View */}
          <TabsContent value="details" className="mt-0">
            {detailLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading employee details...</p>
                </div>
              </div>
            ) : selectedEmployee ? (
              <div className="space-y-6">
                {/* Employee Header */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                        <AvatarImage src={selectedEmployee.profile_image_url || "/placeholder-avatar.jpg"} alt={getFullName(selectedEmployee)} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {getFullName(selectedEmployee).split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h1 className="text-3xl font-bold">{getFullName(selectedEmployee)}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg text-muted-foreground">
                                  {selectedEmployee.designation || selectedEmployee.role}
                                </span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg text-muted-foreground">
                                  {selectedEmployee.department || 'No Department'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`mt-4 lg:mt-0 text-base py-1.5 px-3 ${getStatusColor(selectedEmployee.current_status)}`}>
                            {selectedEmployee.current_status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={IdCard}
                    label="Employee ID"
                    value={selectedEmployee.employee_id || 'N/A'}
                  />
                  <StatCard
                    icon={Calendar}
                    label="Join Date"
                    value={formatDate(selectedEmployee.joining_date)}
                  />
                  <StatCard
                    icon={IndianRupee}
                    label="Salary"
                    value={selectedEmployee.salary ? `₹${selectedEmployee.salary}` : 'N/A'}
                  />
                  <StatCard
                    icon={Award}
                    label="Role"
                    value={selectedEmployee.role.replace('_', ' ')}
                    className="capitalize"
                  />
                </div>

                {/* Rest of the detail view tabs */}
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
                    <TabsTrigger value="personal" className="flex items-center gap-2 py-3">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="employment" className="flex items-center gap-2 py-3">
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden sm:inline">Employment</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2 py-3">
                      <Image className="h-4 w-4" />
                      <span className="hidden sm:inline">Media</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information */}
                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Contact className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{selectedEmployee.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{selectedEmployee.phone_number || 'N/A'}</p>
                            </div>
                          </div>
                          {selectedEmployee.address && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <MapPin className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">
                                  {selectedEmployee.address}
                                  {selectedEmployee.city && `, ${selectedEmployee.city}`}
                                  {selectedEmployee.state && `, ${selectedEmployee.state}`}
                                  {selectedEmployee.postal_code && `, ${selectedEmployee.postal_code}`}
                                  {selectedEmployee.country && `, ${selectedEmployee.country}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Date of Birth</p>
                              <p className="font-medium flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                {selectedEmployee.date_of_birth ? formatDate(selectedEmployee.date_of_birth) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Gender</p>
                              <p className="font-medium capitalize">{selectedEmployee.gender || 'N/A'}</p>
                            </div>
                          </div>
                          
                          {selectedEmployee.emergency_contact_name && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">Emergency Contact</p>
                              <p className="font-medium">
                                {selectedEmployee.emergency_contact_name} 
                                {selectedEmployee.emergency_contact_relation && ` (${selectedEmployee.emergency_contact_relation})`}
                              </p>
                              {selectedEmployee.emergency_contact_phone && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {selectedEmployee.emergency_contact_phone}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Employment Information */}
                  <TabsContent value="employment" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Employment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <IdCard className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Employee ID</p>
                                <p className="font-medium">{selectedEmployee.employee_id || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Shield className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Role</p>
                                <p className="font-medium capitalize">{selectedEmployee.role.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Building className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-medium">{selectedEmployee.department || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Calendar className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Joining Date</p>
                                <p className="font-medium">{formatDate(selectedEmployee.joining_date)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documents ({selectedEmployee.documents?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEmployee.documents.map((doc) => (
                              <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{doc.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {doc.document_type} • {formatDate(doc.uploaded_at)}
                                      </p>
                                      {doc.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                          {doc.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                    {doc.is_verified && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Verified
                                      </Badge>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadFile(doc.file_url, doc.title)}
                                      className="flex items-center gap-2"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No documents available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Media Files ({selectedEmployee.media_files?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedEmployee.media_files && selectedEmployee.media_files.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedEmployee.media_files.map((media) => (
                              <Card key={media.id} className="group overflow-hidden">
                                <div className="aspect-video bg-muted flex items-center justify-center relative">
                                  {media.file_url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                                    <img
                                      src={media.file_url}
                                      alt={media.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <FileText className="h-12 w-12 text-muted-foreground" />
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                                <CardContent className="p-4">
                                  <p className="font-medium text-sm truncate">{media.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {media.media_type} • {formatDate(media.uploaded_at)}
                                  </p>
                                  {media.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {media.description}
                                    </p>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-3"
                                    onClick={() => handleDownloadFile(media.file_url, media.title)}
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    Download
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No media files available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No employee data available</p>
                  <Button onClick={handleBackToList} className="mt-4">
                    Back to Employee List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Employee Modal */}
      <AddEmployeeModal 
        open={isAddEmployeeModalOpen} 
        onOpenChange={handleModalClose}
        onEmployeeAdded={handleEmployeeAdded}
        onEmployeeUpdated={handleEmployeeUpdated}
        employeeToEdit={employeeToEdit}
        mode={modalMode}
      />
    </>
  );
};

export default Employees;