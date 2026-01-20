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
  DialogFooter,
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
  AlertCircle,
  RefreshCw,
  Edit
} from 'lucide-react';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useToast } from '@/components/ui/use-toast';
import AddEventModal from '@/components/modals/AddEventModal';

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
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(requests.EventList);
      const data = response.data;

      const events = Array.isArray(data) ? data : (data.results || data.events || []);

      const formattedEvents: CalendarEvent[] = events.map((event: any) => ({
        ...event,
        id: event.id,
        title: event.name || event.title,
        description: event.description,
        date: event.event_date || event.date,
        time: event.start_time || event.time || "09:00 AM",
        duration: event.duration_minutes ? `${event.duration_minutes}m` : (event.duration || "1h"),
        type: event.event_type || event.type || 'event',
        attendees: event.assigned_employee_details ? [{
          name: `${event.assigned_employee_details.first_name} ${event.assigned_employee_details.last_name}`,
          initials: `${event.assigned_employee_details.first_name?.[0] || ''}${event.assigned_employee_details.last_name?.[0] || ''}`
        }] : (event.attendees || []),
        color: event.color || (event.event_type === 'meeting' ? 'bg-blue-500' : 'bg-emerald-500'),
        status: event.status
      }));

      setCalendarEvents(formattedEvents);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateEvents(getEventsForDate(date));
    setIsDateModalOpen(true);
  };

  const handleAddNewEventFromDate = () => {
    setModalMode('add');
    setEventToEdit(null);
    setIsDateModalOpen(false);
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setModalMode('edit');
    setEventToEdit(event);
    setIsDateModalOpen(false);
    setIsAddEventModalOpen(true);
  };

  const handleNewEventClick = () => {
    setModalMode('add');
    setEventToEdit(null);
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage client payments, employee tasks, and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={handleNewEventClick}><Plus className="h-4 w-4 mr-2" />New Event</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-xl font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-muted">
            {weekDays.map(day => <div key={day} className="bg-background py-2 text-center text-sm font-medium">{day}</div>)}
            {getDaysInMonth().map((day, i) => (
              <div
                key={i}
                onClick={() => handleDateClick(day)}
                className={`min-h-[120px] bg-background p-2 cursor-pointer hover:bg-muted/50 transition-colors ${day.getMonth() !== currentDate.getMonth() ? 'text-muted-foreground bg-muted/20' : ''}`}
              >
                <span className={`text-sm font-medium ${day.toDateString() === new Date().toDateString() ? 'bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center' : ''}`}>
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {getEventsForDate(day).map(event => (
                    <div key={event.id} className={`text-[10px] p-1 rounded border-l-2 truncate ${event.color} text-white`}>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddEventModal
        open={isAddEventModalOpen}
        onOpenChange={setIsAddEventModalOpen}
        mode={modalMode}
        onEventCreated={fetchData}
        onEventUpdated={fetchData}
        onEventDeleted={fetchData}
        eventToEdit={eventToEdit}
        defaultDate={selectedDate || undefined}
      />

      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${event.color} text-white`}>
                      {event.type === 'payment' ? <DollarSign className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 text-primary">{event.time} • {event.duration}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No events for this date</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button className="w-full" onClick={handleAddNewEventFromDate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event for this Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
