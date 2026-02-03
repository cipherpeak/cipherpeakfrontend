import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DollarSign,
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
  type: string;
  attendees: { name: string; initials: string }[];
  color: string;
  status?: string;
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
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(requests.EventList);
      const data = response.data;
      const events = Array.isArray(data) ? data : (data.results || []);

      const formattedEvents: CalendarEvent[] = events.map((event: any) => ({
        ...event,
        title: event.name || event.title,
        date: event.event_date || event.date,
        time: event.start_time || event.time || "09:00 AM",
        duration: event.duration_minutes ? `${event.duration_minutes}m` : (event.duration || "1h"),
        type: event.event_type || event.type || 'event',
        color: event.color || (event.event_type === 'meeting' ? 'bg-blue-500' : 'bg-emerald-500'),
      }));
      setCalendarEvents(formattedEvents);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') newDate.setMonth(prevDate.getMonth() - 1);
      else newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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

  const handleEditEvent = (event: any) => {
    setModalMode('edit');
    setEventToEdit(event);
    setIsDateModalOpen(false);
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage events and schedules across the board</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={() => { setModalMode('add'); setEventToEdit(null); setIsAddEventModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />New Event
          </Button>
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
                  {getEventsForDate(day).slice(0, 3).map(event => (
                    <div key={event.id} className={`text-[10px] p-1 rounded border-l-2 truncate ${event.color} text-white`}>
                      {event.title}
                    </div>
                  ))}
                  {getEventsForDate(day).length > 3 && (
                    <div className="text-[10px] text-center text-muted-foreground">+{getEventsForDate(day).length - 3} more</div>
                  )}
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
          <DialogHeader><DialogTitle>{selectedDate?.toLocaleDateString()}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 group">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${event.color} text-white`}>
                      {event.type === 'payment' ? <DollarSign className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time} • {event.duration}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEvent(event)}><Edit className="h-4 w-4" /></Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No events for this date</p>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => { setIsDateModalOpen(false); setModalMode('add'); setEventToEdit(null); setIsAddEventModalOpen(true); }}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
