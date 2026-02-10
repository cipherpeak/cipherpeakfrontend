import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
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
import { CalendarIcon, Loader2, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reverting to static mode


import { useToast } from '@/components/ui/use-toast';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
}

interface Client {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  company: string;
  is_active_client?: boolean;
}

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
  taskToEdit?: any;
  mode?: 'add' | 'edit';
}

const AddTaskModal = ({
  open,
  onOpenChange,
  onTaskCreated,
  onTaskUpdated,
  taskToEdit,
  mode = 'add'
}: AddTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    client: '',
    priority: 'medium',
    status: 'pending',
    task_type: '',
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const { toast } = useToast();

  // Task type options from your backend model
  const taskTypeOptions = [
    { value: 'seo', label: 'SEO' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'content', label: 'Content Creation' },
    { value: 'ppc', label: 'PPC Campaign' },
    { value: 'website', label: 'Website Development' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'client_meeting', label: 'Client Meeting' },
  ];

  // Priority options from your backend model
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  // Status options from your backend model
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'scheduled', label: 'Scheduled' },
  ];





  // Fetch employees for assignee dropdown
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await axiosInstance.get(requests.EmployeeList);
      // Handle pagination or direct array if applicable (similar to Employees.tsx logic)
      const data = response.data;
      let employeeList: Employee[] = [];

      if (Array.isArray(data)) {
        employeeList = data;
      } else if (data.results && Array.isArray(data.results)) {
        employeeList = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        employeeList = data.data;
      } else if (data.employees && Array.isArray(data.employees)) {
        employeeList = data.employees;
      }

      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({ title: "Error", description: "Failed to load employees", variant: "destructive" });
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch clients for client dropdown
  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const response = await axiosInstance.get(requests.ClientList);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({ title: "Error", description: "Failed to load clients", variant: "destructive" });
    } finally {
      setClientsLoading(false);
    }
  };

  // Fetch employees and clients when modal opens
  useEffect(() => {
    if (open) {
      if (employees.length === 0) fetchEmployees();
      if (clients.length === 0) fetchClients();
    }
  }, [open]);

  // Populate form data when in edit mode and data is available
  useEffect(() => {
    if (open && mode === 'edit' && taskToEdit && employees.length > 0 && clients.length > 0) {
      // Pre-fill form with task data for editing - only after employees and clients are loaded
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        assignee: taskToEdit.assignee?.toString() || taskToEdit.assignee_details?.id?.toString() || '',
        client: taskToEdit.client?.toString() || taskToEdit.client_details?.id?.toString() || '',
        priority: taskToEdit.priority || 'medium',
        status: taskToEdit.status || 'pending',
        task_type: taskToEdit.task_type || '',
      });
    } else if (open && mode === 'add') {
      // Reset form for new task
      resetForm();
    }
  }, [open, mode, taskToEdit, employees, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assignee) {
      toast({ title: 'Error', description: 'Please select an assignee', variant: 'destructive' });
      return;
    }
    if (!formData.client) {
      toast({ title: 'Error', description: 'Please select a client', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
      };

      if (mode === 'add') {
        await axiosInstance.post(requests.TaskCreate, payload);
        if (onTaskCreated) onTaskCreated();
        toast({ title: 'Success', description: 'Task created successfully' });
      } else {
        await axiosInstance.put(requests.TaskUpdate(taskToEdit.id), payload);
        if (onTaskUpdated) onTaskUpdated();
        toast({ title: 'Success', description: 'Task updated successfully' });
      }

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving task:", error);
      if (error.response) {
        console.error("Server Error Response:", error.response.data);
        toast({ title: "Error", description: `Failed to save task: ${JSON.stringify(error.response.data)}`, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to save task", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignee: '',
      client: '',
      priority: 'medium',
      status: 'pending',
      task_type: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the task details, assignee, and client information.'
              : 'Add a new task to assign to team members with deadlines, priorities, and client association.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the task in detail..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) => handleInputChange('task_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To *</Label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) => handleInputChange('assignee', value)}
                  disabled={employeesLoading}
                >
                  <SelectTrigger>
                    {employeesLoading ? (
                      <span>Loading employees...</span>
                    ) : (
                      <SelectValue placeholder="Select team member" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        <div className="flex flex-col">
                          <span>{employee.first_name} {employee.last_name}</span>
                          {employee.designation && (
                            <span className="text-xs text-muted-foreground">
                              {employee.designation}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.client}
                onValueChange={(value) => handleInputChange('client', value)}
                disabled={clientsLoading}
              >
                <SelectTrigger>
                  {clientsLoading ? (
                    <span>Loading clients...</span>
                  ) : (
                    <SelectValue placeholder="Select client" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>{client.client_name}</span>
                          {client.company && (
                            <span className="text-xs text-muted-foreground">
                              {client.company}
                            </span>
                          )}
                          {client.is_active_client !== undefined && (
                            <span className={`text-xs ${client.is_active_client ? 'text-green-600' : 'text-red-600'}`}>
                              {client.is_active_client ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="text-xs text-muted-foreground">
              <p>* Required fields</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading || !formData.title || !formData.assignee || !formData.client}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
