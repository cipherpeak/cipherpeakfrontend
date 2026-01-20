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
import { CalendarIcon, Loader2, Clock, MapPin, User, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';


import { useToast } from '@/components/ui/use-toast';
// Backend API mode

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
}

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
  onEventUpdated?: () => void;
  onEventDeleted?: () => void;
  eventToEdit?: any;
  mode?: 'add' | 'edit';
  defaultDate?: Date;
}

const AddEventModal = ({
  open,
  onOpenChange,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  eventToEdit,
  mode = 'add',
  defaultDate
}: AddEventModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: 'meeting',
    assigned_employee: '',
    location: '',
    status: 'scheduled',
    duration_minutes: '',
    is_recurring: 'false',
    recurrence_pattern: '',
  });
  const [eventDate, setEventDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const { toast } = useToast();

  // Event type options from your Django model
  const eventTypeOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'special_day', label: 'Special Day' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'training', label: 'Training' },
    { value: 'team_building', label: 'Team Building' },
    { value: 'client_meeting', label: 'Client Meeting' },
    { value: 'project_review', label: 'Project Review' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'other', label: 'Other' },
  ];

  // Status options from your Django model
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'postponed', label: 'Postponed' },
  ];

  // Duration options in minutes
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: 'Full day (8 hours)' },
  ];

  // Recurrence pattern options
  const recurrenceOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Time slots for start time
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Fetch employees for assigned employee dropdown
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await axiosInstance.get(requests.EmployeeList);
      const data = response.data;
      console.log("Employees API Response:", data);
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

  // Initialize form when modal opens or eventToEdit changes
  useEffect(() => {
    if (open) {
      fetchEmployees();

      if (mode === 'edit' && eventToEdit) {
        // Pre-fill form with event data for editing
        setFormData({
          name: eventToEdit.name || eventToEdit.title || '',
          description: eventToEdit.description || '',
          event_type: eventToEdit.event_type || 'meeting',
          assigned_employee: eventToEdit.assigned_employee?.toString() || eventToEdit.assigned_employee_details?.id?.toString() || '',
          location: eventToEdit.location || '',
          status: eventToEdit.status || 'scheduled',
          duration_minutes: eventToEdit.duration_minutes?.toString() || '',
          is_recurring: eventToEdit.is_recurring ? 'true' : 'false',
          recurrence_pattern: eventToEdit.recurrence_pattern || '',
        });
        console.log("Edit mode: Form data initialized with:", {
          name: eventToEdit.name || eventToEdit.title,
          employee: eventToEdit.assigned_employee || eventToEdit.assigned_employee_details?.id
        });

        if (eventToEdit.event_date) {
          const eventDate = new Date(eventToEdit.event_date);
          setEventDate(eventDate);
          setStartTime(format(eventDate, 'HH:mm'));
        }
      } else {
        // Reset form for new event
        resetForm();
        if (defaultDate) {
          setEventDate(defaultDate);
        }
      }
    }
  }, [open, mode, eventToEdit, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assigned_employee) {
      toast({
        title: 'Error',
        description: 'Please select an assigned employee',
        variant: 'destructive',
      });
      return;
    }

    if (!eventDate) {
      toast({
        title: 'Error',
        description: 'Please select an event date',
        variant: 'destructive',
      });
      return;
    }

    if (!startTime) {
      toast({
        title: 'Error',
        description: 'Please select a start time',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Format the date and time for the backend
      // Backend expects 'event_date' (date) and 'start_time' (time) or combined
      // Looking at the provided URLs, it seems to handle them.

      const payload = {
        name: formData.name,
        description: formData.description,
        event_type: formData.event_type,
        assigned_employee: parseInt(formData.assigned_employee),
        location: formData.location,
        status: formData.status,
        duration_minutes: parseInt(formData.duration_minutes) || 60,
        event_date: format(eventDate, 'yyyy-MM-dd'),
        start_time: startTime,
      };

      console.log("Saving event with payload:", payload);

      if (mode === 'add') {
        await axiosInstance.post(requests.EventCreate, payload);
        toast({ title: 'Success', description: 'Event created successfully' });
        if (onEventCreated) onEventCreated();
      } else {
        await axiosInstance.put(requests.EventUpdate(eventToEdit.id), payload);
        toast({ title: 'Success', description: 'Event updated successfully' });
        if (onEventUpdated) onEventUpdated();
      }

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving event:", error);
      const errorData = error.response?.data;
      let errorMessage = 'Failed to save event';

      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Extract errors from Django REST Framework format
          errorMessage = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join(' | ');
        }
      }

      toast({
        title: 'Error',
        description: errorMessage || error.message || 'Failed to save event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.delete(requests.EventDelete(eventToEdit.id));
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      if (onEventDeleted) onEventDeleted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event_type: 'meeting',
      assigned_employee: '',
      location: '',
      status: 'scheduled',
      duration_minutes: '',
      is_recurring: 'false',
      recurrence_pattern: '',
    });
    setEventDate(undefined);
    setStartTime('');
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
            {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the event details, assigned employee, and scheduling information.'
              : 'Schedule a new event or meeting with your team members.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                placeholder="Enter event name..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the event purpose and agenda..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => handleInputChange('event_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={startTime}
                  onValueChange={setStartTime}
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration</Label>
                <Select
                  value={formData.duration_minutes}
                  onValueChange={(value) => handleInputChange('duration_minutes', value)}
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_employee">Assigned Employee *</Label>
                <Select
                  value={formData.assigned_employee}
                  onValueChange={(value) => handleInputChange('assigned_employee', value)}
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
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>{employee.first_name} {employee.last_name}</span>
                            {employee.designation && (
                              <span className="text-xs text-muted-foreground">
                                {employee.designation}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Conference Room A, Online, Office Location..."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="is_recurring">Recurring Event</Label>
                <Select
                  value={formData.is_recurring}
                  onValueChange={(value) => handleInputChange('is_recurring', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.is_recurring === 'true' && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                  <Select
                    value={formData.recurrence_pattern}
                    onValueChange={(value) => handleInputChange('recurrence_pattern', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceOptions.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>* Required fields</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete Event
                </Button>
              )}
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading || !formData.name || !formData.assigned_employee || !eventDate || !startTime}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === 'edit' ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
