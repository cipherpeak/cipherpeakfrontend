import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  Building,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Zap,
  CalendarCheck,
  FileText,
  MapPin,
  Target,
  User,
  Briefcase,
  CheckCircle,
  PlayCircle,
  Clock as ClockIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import AddEventModal from '@/components/modals/AddEventModal';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';

interface Client {
  id: number;
  client_name: string;
  client_type: string;
  industry: string;
  status: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  monthly_retainer?: string;
  payment_cycle: string;
  payment_date: number;
  next_payment_date: string;
  current_month_payment_status: string;
  last_payment_date?: string;
  is_payment_overdue?: boolean;
  days_until_next_payment?: number;
  payment_status_display?: string;
  total_content_per_month?: number;
  is_active_client?: boolean;
  payment_timing?: string;
  early_payment_date?: string;
  early_payment_amount?: string;
  early_payment_notes?: string;
  is_early_payment?: boolean;
  early_payment_days?: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: number;
  assignee_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    designation: string;
    department: string;
    employee_id: string;
    phone_number: string;
  };
  client: number;
  client_details: {
    id: number;
    client_name: string;
    email: string;
    phone: string;
    company: string;
    total_content_per_month?: number;
    is_active_client?: boolean;
  };
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  task_type: string;
  task_type_display: string;
  due_date: string;
  scheduled_date: string | null;
  completed_at: string | null;
  created_by: number;
  created_by_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    designation: string;
    department: string;
    employee_id: string;
    phone_number: string;
  };
  created_at: string;
  updated_at: string;
  is_overdue?: boolean;
}

interface Event {
  id: number;
  name: string;
  description: string;
  event_date: string;
  event_type: string;
  event_type_display: string;
  assigned_employee: number;
  assigned_employee_details: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    designation: string;
    department: string;
  };
  location: string;
  status: string;
  status_display: string;
  duration_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_by: number;
  created_by_details: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  is_past_event: boolean;
  is_upcoming: boolean;
  time_until_event: string;
  event_duration_display: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  type: 'payment' | 'meeting' | 'presentation' | 'review' | 'interview' | 'planning' | 'early_payment' | 'task' | 'event';
  attendees: { name: string; initials: string }[];
  color: string;
  client_id?: number;
  task_id?: number;
  event_id?: number;
  is_payment_event?: boolean;
  is_early_payment_event?: boolean;
  is_task_event?: boolean;
  is_calendar_event?: boolean;
  amount?: string;
  status?: string;
  payment_status?: string;
  payment_timing?: string;
  is_overdue?: boolean;
  original_due_date?: string;
  early_payment_days?: number;
  priority?: string;
  task_type?: string;
  assignee?: any;
  location?: string;
  event_type?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients, tasks, and events from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch clients
      const clientsResponse = await axiosInstance.get(requests.FetchClients);
      const clientsData = clientsResponse.data.results || clientsResponse.data;
      setClients(clientsData);
      
      // Fetch tasks
      const tasksResponse = await axiosInstance.get(requests.FetchTasks);
      const tasksData = tasksResponse.data.results || tasksResponse.data;
      setTasks(tasksData);
      
      // Fetch events
      const eventsResponse = await axiosInstance.get(requests.FetchEvents);
      const eventsData = eventsResponse.data.results || eventsResponse.data;
      setEvents(eventsData);
      
      // Generate events from clients, tasks, and calendar events
      generatePaymentEvents(clientsData);
      generateTaskEvents(tasksData);
      generateCalendarEvents(eventsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle event creation
  const handleEventCreated = () => {
    fetchData(); // Refresh all data including the new event
  };

  // Check if client has early payment
  const isEarlyPayment = (client: Client): boolean => {
    return (
      client.is_early_payment === true ||
      client.payment_timing === 'early' ||
      (client.current_month_payment_status === 'paid' && client.early_payment_date !== null) ||
      (client.current_month_payment_status === 'paid' && client.payment_timing === 'early')
    );
  };

  // Generate payment events from client data with early payment support
  const generatePaymentEvents = (clientsData: Client[]) => {
    const paymentEvents: CalendarEvent[] = [];

    clientsData.forEach(client => {
      const hasEarlyPayment = isEarlyPayment(client);

      // Create event for next payment date
      if (client.next_payment_date) {
        const isOverdue = client.is_payment_overdue;
        const isPaid = client.current_month_payment_status === 'paid';
        const isPending = client.current_month_payment_status === 'pending';
        const isOverdueStatus = client.current_month_payment_status === 'overdue';
        
        let eventColor = '';
        let eventType: 'payment' | 'early_payment' = 'payment';
        let isEarlyPaymentEvent = false;
        
        if (hasEarlyPayment) {
          eventColor = 'bg-emerald-500';
          eventType = 'early_payment';
          isEarlyPaymentEvent = true;
        } else if (isPaid) {
          eventColor = 'bg-green-500';
        } else if (isOverdue || isOverdueStatus) {
          eventColor = 'bg-red-500';
        } else if (isPending) {
          eventColor = 'bg-yellow-500';
        } else {
          eventColor = 'bg-blue-500';
        }

        const paymentEvent: CalendarEvent = {
          id: client.id * 1000,
          title: hasEarlyPayment ? `${client.client_name} ⚡ Early Paid` : 
                 isPaid ? `${client.client_name} ✓ Paid` : `${client.client_name} Payment`,
          description: `Monthly retainer payment${client.monthly_retainer ? ` of $${client.monthly_retainer}` : ''} - ${client.status} client${hasEarlyPayment ? ' - Early Payment' : ''}`,
          date: client.next_payment_date,
          time: '09:00',
          duration: '1 day',
          type: eventType,
          attendees: [
            { 
              name: client.contact_person_name || client.client_name, 
              initials: getInitials(client.contact_person_name || client.client_name) 
            }
          ],
          color: eventColor,
          client_id: client.id,
          is_payment_event: true,
          is_early_payment_event: isEarlyPaymentEvent,
          amount: client.monthly_retainer,
          status: client.current_month_payment_status,
          payment_status: client.current_month_payment_status,
          payment_timing: client.payment_timing,
          is_overdue: client.is_payment_overdue,
          early_payment_days: client.early_payment_days
        };

        paymentEvents.push(paymentEvent);
      }

      // Create additional event for early payment date if it exists and is different from next payment date
      if (client.early_payment_date && hasEarlyPayment) {
        const earlyPaymentDate = new Date(client.early_payment_date);
        const nextPaymentDate = client.next_payment_date ? new Date(client.next_payment_date) : null;
        
        if (!nextPaymentDate || earlyPaymentDate.toISOString().split('T')[0] !== nextPaymentDate.toISOString().split('T')[0]) {
          const earlyPaymentEvent: CalendarEvent = {
            id: client.id * 1000 + 1,
            title: `${client.client_name} ⚡ Early Paid`,
            description: `Early payment${client.early_payment_amount ? ` of $${client.early_payment_amount}` : client.monthly_retainer ? ` of $${client.monthly_retainer}` : ''}${client.early_payment_days ? ` - ${client.early_payment_days} days early` : ''}`,
            date: client.early_payment_date,
            time: '09:00',
            duration: '1 day',
            type: 'early_payment',
            attendees: [
              { 
                name: client.contact_person_name || client.client_name, 
                initials: getInitials(client.contact_person_name || client.client_name) 
              }
            ],
            color: 'bg-emerald-500',
            client_id: client.id,
            is_payment_event: true,
            is_early_payment_event: true,
            amount: client.early_payment_amount || client.monthly_retainer,
            status: 'paid',
            payment_status: 'paid',
            payment_timing: 'early',
            early_payment_days: client.early_payment_days
          };

          paymentEvents.push(earlyPaymentEvent);
        }
      }

      // Create event for last payment date if it exists and is recent (within last 30 days)
      if (client.last_payment_date) {
        const lastPaymentDate = new Date(client.last_payment_date);
        const today = new Date();
        const timeDiff = today.getTime() - lastPaymentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff <= 30) {
          const isEarly = hasEarlyPayment;
          
          const lastPaymentEvent: CalendarEvent = {
            id: client.id * 1000 + 2,
            title: `${client.client_name} ✓ ${isEarly ? 'Early ' : ''}Paid`,
            description: `Payment completed${client.monthly_retainer ? ` of $${client.monthly_retainer}` : ''}${isEarly && client.early_payment_days ? ` - ${client.early_payment_days} days early` : ''}`,
            date: client.last_payment_date,
            time: '09:00',
            duration: '1 day',
            type: isEarly ? 'early_payment' : 'payment',
            attendees: [
              { 
                name: client.contact_person_name || client.client_name, 
                initials: getInitials(client.contact_person_name || client.client_name) 
              }
            ],
            color: isEarly ? 'bg-emerald-500' : 'bg-green-500',
            client_id: client.id,
            is_payment_event: true,
            is_early_payment_event: isEarly,
            amount: client.monthly_retainer,
            status: 'paid',
            payment_status: 'paid',
            payment_timing: client.payment_timing,
            early_payment_days: client.early_payment_days
          };

          paymentEvents.push(lastPaymentEvent);
        }
      }
    });

    setCalendarEvents(prev => [...prev.filter(e => !e.is_payment_event), ...paymentEvents]);
  };

  // Generate task events from task data
  const generateTaskEvents = (tasksData: Task[]) => {
    const taskEvents: CalendarEvent[] = [];

    tasksData.forEach(task => {
      const isCompleted = task.status === 'completed';
      const isOverdue = task.is_overdue;
      const dueDate = task.due_date;

      let eventColor = '';
      if (isCompleted) {
        eventColor = 'bg-green-500';
      } else if (isOverdue) {
        eventColor = 'bg-red-500';
      } else {
        // Color based on priority
        switch (task.priority.toLowerCase()) {
          case 'high':
            eventColor = 'bg-orange-500';
            break;
          case 'medium':
            eventColor = 'bg-blue-500';
            break;
          case 'low':
            eventColor = 'bg-gray-500';
            break;
          default:
            eventColor = 'bg-purple-500';
        }
      }

      const taskEvent: CalendarEvent = {
        id: task.id * 1000 + 500, // Offset to avoid conflicts with payment events
        title: `${task.title}${isCompleted ? ' ✓ Completed' : ''}`,
        description: task.description || `Task for ${task.client_details?.client_name || 'client'}`,
        date: dueDate,
        time: '10:00',
        duration: '2 hours',
        type: 'task',
        attendees: [
          { 
            name: task.assignee_details.full_name, 
            initials: getInitials(task.assignee_details.first_name, task.assignee_details.last_name) 
          }
        ],
        color: eventColor,
        task_id: task.id,
        is_task_event: true,
        status: task.status,
        priority: task.priority,
        task_type: task.task_type,
        assignee: task.assignee_details,
        is_overdue: task.is_overdue
      };

      taskEvents.push(taskEvent);

      // Also create events for scheduled dates if they exist
      if (task.scheduled_date && task.scheduled_date !== dueDate) {
        const scheduledEvent: CalendarEvent = {
          id: task.id * 1000 + 501,
          title: `${task.title} (Scheduled)`,
          description: `Scheduled task - ${task.description || `Task for ${task.client_details?.client_name || 'client'}`}`,
          date: task.scheduled_date,
          time: '10:00',
          duration: '2 hours',
          type: 'task',
          attendees: [
            { 
              name: task.assignee_details.full_name, 
              initials: getInitials(task.assignee_details.first_name, task.assignee_details.last_name) 
            }
          ],
          color: 'bg-purple-500',
          task_id: task.id,
          is_task_event: true,
          status: 'scheduled',
          priority: task.priority,
          task_type: task.task_type,
          assignee: task.assignee_details
        };

        taskEvents.push(scheduledEvent);
      }
    });

    setCalendarEvents(prev => [...prev.filter(e => !e.is_task_event), ...taskEvents]);
  };

  // Generate calendar events from events data
  const generateCalendarEvents = (eventsData: Event[]) => {
    const calendarEventItems: CalendarEvent[] = [];

    eventsData.forEach(event => {
      const eventDate = new Date(event.event_date);
      const isPastEvent = event.is_past_event;
      const isCompleted = event.status === 'completed';
      const isCancelled = event.status === 'cancelled';

      let eventColor = '';
      if (isCancelled) {
        eventColor = 'bg-gray-500';
      } else if (isCompleted) {
        eventColor = 'bg-green-500';
      } else if (isPastEvent) {
        eventColor = 'bg-yellow-500';
      } else {
        // Color based on event type
        switch (event.event_type) {
          case 'meeting':
            eventColor = 'bg-blue-500';
            break;
          case 'conference':
            eventColor = 'bg-purple-500';
            break;
          case 'workshop':
            eventColor = 'bg-indigo-500';
            break;
          case 'training':
            eventColor = 'bg-teal-500';
            break;
          case 'special_day':
            eventColor = 'bg-pink-500';
            break;
          case 'birthday':
            eventColor = 'bg-red-500';
            break;
          case 'anniversary':
            eventColor = 'bg-rose-500';
            break;
          case 'holiday':
            eventColor = 'bg-orange-500';
            break;
          default:
            eventColor = 'bg-gray-500';
        }
      }

      const duration = event.duration_minutes 
        ? event.event_duration_display 
        : '2 hours'; // Default duration

      const calendarEvent: CalendarEvent = {
        id: event.id * 1000 + 1000, // Offset to avoid conflicts with other events
        title: event.name,
        description: event.description || `${event.event_type_display} event`,
        date: event.event_date.split('T')[0],
        time: formatTimeFromDate(event.event_date),
        duration: duration,
        type: 'event',
        attendees: [
          { 
            name: event.assigned_employee_details.full_name, 
            initials: getInitials(event.assigned_employee_details.first_name, event.assigned_employee_details.last_name) 
          }
        ],
        color: eventColor,
        event_id: event.id,
        is_calendar_event: true,
        status: event.status,
        location: event.location,
        event_type: event.event_type,
        assignee: event.assigned_employee_details
      };

      calendarEventItems.push(calendarEvent);
    });

    setCalendarEvents(prev => [...prev.filter(e => !e.is_calendar_event), ...calendarEventItems]);
  };

  // Helper function to format time from date string
  const formatTimeFromDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName?: string): string => {
    if (!firstName && !lastName) return 'NA';
    if (typeof firstName === 'string' && firstName.includes(' ')) {
      // If it's a full name string
      return firstName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Get payment status color for badges
  const getPaymentStatusColor = (status: string, isEarlyPayment: boolean = false) => {
    if (isEarlyPayment) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get task status color for badges
  const getTaskStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get event status color for badges
  const getEventStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'postponed': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color for badges
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string, isEarlyPayment: boolean = false) => {
    if (isEarlyPayment) {
      return 'Early Paid';
    }
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      const compareDate = new Date(date);
      
      return eventDate.getDate() === compareDate.getDate() &&
             eventDate.getMonth() === compareDate.getMonth() &&
             eventDate.getFullYear() === compareDate.getFullYear();
    });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    setSelectedDateEvents(dateEvents);
    setIsDateModalOpen(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'early_payment': return <Zap className="h-4 w-4" />;
      case 'task': return <Target className="h-4 w-4" />;
      case 'event': return <CalendarIcon className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'presentation': return <Building className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'All day';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Mark payment as paid
  const handleMarkPaymentPaid = async (clientId: number) => {
    try {
      await axiosInstance.post(`${requests.FetchClients}${clientId}/mark-paid/`);
      fetchData();
      setIsDateModalOpen(false);
    } catch (err: any) {
      console.error('Error marking payment as paid:', err);
      alert('Failed to mark payment as paid');
    }
  };

  // Mark payment as early paid
  const handleMarkEarlyPayment = async (clientId: number) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        await axiosInstance.post(`${requests.FetchClients}${clientId}/mark-early-payment/`, {
          payment_date: new Date().toISOString().split('T')[0],
          amount: client.monthly_retainer,
          notes: 'Marked as early paid from calendar'
        });
        fetchData();
        setIsDateModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error marking early payment:', err);
      alert('Failed to mark early payment');
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`${requests.FetchTasks}${taskId}/`, { status: newStatus });
      fetchData();
      setIsDateModalOpen(false);
    } catch (err: any) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  // Update event status
  const handleUpdateEventStatus = async (eventId: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`${requests.FetchEvents}${eventId}/`, { status: newStatus });
      fetchData();
      setIsDateModalOpen(false);
    } catch (err: any) {
      console.error('Error updating event status:', err);
      alert('Failed to update event status');
    }
  };

  // Get payment action button based on status
  const getPaymentActionButton = (event: CalendarEvent) => {
    if (!event.client_id) return null;

    if (event.status === 'paid' || event.is_early_payment_event) {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {event.is_early_payment_event ? 'Early Paid' : 'Paid'}
        </Badge>
      );
    }

    if (event.status === 'pending' || event.status === 'overdue') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
            onClick={() => event.client_id && handleMarkEarlyPayment(event.client_id!)}
          >
            <Zap className="h-3 w-3 mr-1" />
            Early Pay
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => event.client_id && handleMarkPaymentPaid(event.client_id!)}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark Paid
          </Button>
        </div>
      );
    }

    return null;
  };

  // Get task action buttons based on status
  const getTaskActionButtons = (event: CalendarEvent) => {
    if (!event.task_id) return null;

    const currentStatus = event.status?.toLowerCase();

    if (currentStatus === 'completed') {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {currentStatus !== 'in_progress' && (
          <Button
            size="sm"
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
            onClick={() => event.task_id && handleUpdateTaskStatus(event.task_id!, 'in_progress')}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
        {currentStatus !== 'completed' && (
          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => event.task_id && handleUpdateTaskStatus(event.task_id!, 'completed')}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
      </div>
    );
  };

  // Get event action buttons based on status
  const getEventActionButtons = (event: CalendarEvent) => {
    if (!event.event_id) return null;

    const currentStatus = event.status?.toLowerCase();

    if (currentStatus === 'completed') {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (currentStatus === 'cancelled') {
      return (
        <Badge variant="default" className="text-xs bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {currentStatus !== 'in_progress' && currentStatus !== 'completed' && (
          <Button
            size="sm"
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
            onClick={() => event.event_id && handleUpdateEventStatus(event.event_id!, 'in_progress')}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
        {currentStatus !== 'completed' && (
          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => event.event_id && handleUpdateEventStatus(event.event_id!, 'completed')}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
        {currentStatus !== 'cancelled' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
            onClick={() => event.event_id && handleUpdateEventStatus(event.event_id!, 'cancelled')}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    );
  };

  // Calculate summary for selected date
  const getSelectedDateSummary = () => {
    const paymentEvents = selectedDateEvents.filter(event => event.is_payment_event);
    const taskEvents = selectedDateEvents.filter(event => event.is_task_event);
    const calendarEventItems = selectedDateEvents.filter(event => event.is_calendar_event);
    
    const totalAmount = paymentEvents.reduce((sum, event) => {
      return sum + (parseFloat(event.amount || '0') || 0);
    }, 0);
    
    const paidPayments = paymentEvents.filter(event => event.status === 'paid' || event.is_early_payment_event);
    const pendingPayments = paymentEvents.filter(event => event.status === 'pending');
    const overduePayments = paymentEvents.filter(event => event.status === 'overdue' || event.is_overdue);
    const earlyPayments = paymentEvents.filter(event => event.is_early_payment_event);

    const completedTasks = taskEvents.filter(event => event.status === 'completed');
    const inProgressTasks = taskEvents.filter(event => event.status === 'in_progress');
    const pendingTasks = taskEvents.filter(event => event.status === 'pending');
    const overdueTasks = taskEvents.filter(event => event.is_overdue);

    const completedEvents = calendarEventItems.filter(event => event.status === 'completed');
    const inProgressEvents = calendarEventItems.filter(event => event.status === 'in_progress');
    const scheduledEvents = calendarEventItems.filter(event => event.status === 'scheduled');
    const cancelledEvents = calendarEventItems.filter(event => event.status === 'cancelled');

    return {
      totalPayments: paymentEvents.length,
      totalTasks: taskEvents.length,
      totalEvents: calendarEventItems.length,
      totalAmount,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      earlyPayments: earlyPayments.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      completedEvents: completedEvents.length,
      inProgressEvents: inProgressEvents.length,
      scheduledEvents: scheduledEvents.length,
      cancelledEvents: cancelledEvents.length,
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-4">Error: {error}</div>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const summary = getSelectedDateSummary();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Manage client payments, employee tasks, and events in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddEventModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1  gap-6">
          {/* Calendar View */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={view} onValueChange={setView}>
                    <SelectTrigger className="w-28 sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {/* Week Header */}
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="bg-muted p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 1)}</span>
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {getDaysInMonth().map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    return (
                      <div
                        key={index}
                        className={`bg-card p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] border-r border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                          !isCurrentMonth(day) ? 'opacity-40 bg-muted/30' : ''
                        } ${isToday(day) ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div
                          className={`text-xs sm:text-sm font-medium mb-1 ${
                            isToday(day) ? 'text-primary font-bold' : 
                            !isCurrentMonth(day) ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded-2xl text-white truncate ${event.color} ${
                                event.is_early_payment_event ? 'border-2 border-emerald-300' : 
                                event.is_task_event ? 'border-2 border-white' :
                                event.is_calendar_event ? 'border-2 border-yellow-300' : ''
                              }`}
                              title={`${event.title} - ${event.description}`}
                            >
                              <div className="flex items-center gap-1">
                                {event.is_early_payment_event ? (
                                  <Zap className="h-2 w-2 flex-shrink-0" />
                                ) : event.is_task_event ? (
                                  <Target className="h-2 w-2 flex-shrink-0" />
                                ) : event.is_calendar_event ? (
                                  <CalendarIcon className="h-2 w-2 flex-shrink-0" />
                                ) : event.type === 'payment' ? (
                                  <DollarSign className="h-2 w-2 flex-shrink-0" />
                                ) : null}
                                <span className="truncate text-xs">
                                  {window.innerWidth < 640 
                                    ? event.title.replace(' Payment', '').replace(' Early Payment', '').replace(' ✓ Early Paid', '').replace(' ✓ Paid', '').replace(' ⚡ Early Paid', '').replace(' ✓ Completed', '')
                                    : event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > (window.innerWidth < 640 ? 2 : 3) && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - (window.innerWidth < 640 ? 2 : 3)} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel - Your existing side panel code remains the same */}
          {/* ... (rest of the side panel code) ... */}
        </div>
      </div>

      {/* Date Details Modal */}
      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>

          {/* Summary Cards */}
          {(summary.totalPayments > 0 || summary.totalTasks > 0 || summary.totalEvents > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.totalPayments > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5" />
                      Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-foreground">{summary.totalPayments}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-green-600">${summary.totalAmount.toFixed(2)}</div>
                        <div className="text-muted-foreground">Amount</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-emerald-600">{summary.earlyPayments}</div>
                        <div className="text-muted-foreground">Early</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-red-600">{summary.overduePayments}</div>
                        <div className="text-muted-foreground">Overdue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {summary.totalTasks > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5" />
                      Task Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-foreground">{summary.totalTasks}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-green-600">{summary.completedTasks}</div>
                        <div className="text-muted-foreground">Done</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-blue-600">{summary.inProgressTasks}</div>
                        <div className="text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-red-600">{summary.overdueTasks}</div>
                        <div className="text-muted-foreground">Overdue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {summary.totalEvents > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarIcon className="h-5 w-5" />
                      Event Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-foreground">{summary.totalEvents}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-green-600">{summary.completedEvents}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-blue-600">{summary.inProgressEvents}</div>
                        <div className="text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold text-purple-600">{summary.scheduledEvents}</div>
                        <div className="text-muted-foreground">Scheduled</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Events List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Events, Tasks & Payments ({selectedDateEvents.length})
            </h3>
            
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <Card key={event.id} className={`border-l-4 ${
                    event.is_early_payment_event ? 'border-l-emerald-500' :
                    event.is_task_event ? 'border-l-purple-500' :
                    event.is_calendar_event ? 'border-l-blue-500' :
                    event.status === 'paid' ? 'border-l-green-500' :
                    event.status === 'overdue' ? 'border-l-red-500' :
                    event.status === 'pending' ? 'border-l-yellow-500' :
                    'border-l-gray-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(event.type)}
                              <h4 className="font-semibold text-lg">{event.title}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {event.is_task_event ? (
                                <>
                                  <Badge className={getTaskStatusColor(event.status || '')}>
                                    {formatStatus(event.status || '')}
                                  </Badge>
                                  {event.priority && (
                                    <Badge className={getPriorityColor(event.priority)}>
                                      {event.priority} Priority
                                    </Badge>
                                  )}
                                </>
                              ) : event.is_calendar_event ? (
                                <Badge className={getEventStatusColor(event.status || '')}>
                                  {formatStatus(event.status || '')}
                                </Badge>
                              ) : (
                                <Badge className={getPaymentStatusColor(event.payment_status || event.status || '', event.is_early_payment_event)}>
                                  {formatStatus(event.payment_status || event.status || '', event.is_early_payment_event)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTime(event.time)} • {event.duration}</span>
                            </div>
                            
                            {event.amount && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">${event.amount}</span>
                              </div>
                            )}
                            
                            {event.early_payment_days && (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <Zap className="h-4 w-4" />
                                <span>Paid {event.early_payment_days} days early</span>
                              </div>
                            )}
                            
                            {event.is_overdue && (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{event.is_task_event ? 'Task Overdue' : 'Payment Overdue'}</span>
                              </div>
                            )}

                            {event.is_task_event && event.task_type && (
                              <div className="flex items-center gap-2 text-purple-600">
                                <Briefcase className="h-4 w-4" />
                                <span>{event.task_type}</span>
                              </div>
                            )}

                            {event.is_calendar_event && event.event_type && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{event.event_type}</span>
                              </div>
                            )}

                            {event.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>

                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {event.attendees.map((attendee, index) => (
                                    <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                        {attendee.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {event.attendees.map(a => a.name).join(', ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2">
                          {event.is_payment_event && getPaymentActionButton(event)}
                          {event.is_task_event && getTaskActionButtons(event)}
                          {event.is_calendar_event && getEventActionButtons(event)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-muted-foreground mb-2">
                    No Events Scheduled
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    There are no events, payments, or tasks scheduled for this date.
                  </p>
                  <Button onClick={() => setIsAddEventModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddEventModal 
        open={isAddEventModalOpen} 
        onOpenChange={setIsAddEventModalOpen}
        onEventCreated={handleEventCreated}
      />
    </>
  );
};

export default Calendar;