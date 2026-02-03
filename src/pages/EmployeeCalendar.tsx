import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    RefreshCw,
    Layout,
    CalendarDays,
    MapPin,
    Search,
    Zap,
    Star,
    ArrowUpRight,
    SearchIcon,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    type: string;
    color: string;
    location?: string;
}

const EmployeeCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);

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
                color: event.color || (event.event_type === 'meeting' ? 'bg-blue-600' : 'bg-green-500'),
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
        const events = getEventsForDate(date);
        if (events.length > 0) {
            setSelectedDate(date);
            setSelectedDateEvents(events);
            setIsDateModalOpen(true);
        }
    };

    const upcomingEvents = calendarEvents
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section matching Dashboard/Tasks */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your schedule and upcoming organizational events.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl h-10 border-gray-100 hover:bg-gray-50 font-bold px-4" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        SYNC
                    </Button>
                    <Button className="rounded-xl h-10 shadow-sm px-6 font-bold" onClick={() => setCurrentDate(new Date())}>
                        TODAY
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Calendar Card */}
                <Card className="xl:col-span-3 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {monthNames[currentDate.getMonth()]} <span className="text-muted-foreground font-medium">{currentDate.getFullYear()}</span>
                                </h2>
                                <div className="flex items-center p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 rounded-lg" onClick={() => navigateMonth('prev')}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 rounded-lg" onClick={() => navigateMonth('next')}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Meetings</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Missions</div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Days of week */}
                        <div className="grid grid-cols-7 border-b border-gray-50 bg-white">
                            {weekDays.map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-gray-50">
                            {getDaysInMonth().map((day, i) => {
                                const events = getEventsForDate(day);
                                const isToday = day.toDateString() === new Date().toDateString();
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDateClick(day)}
                                        className={cn(
                                            "min-h-[120px] bg-white group transition-all duration-200 hover:bg-gray-50/80 cursor-pointer p-3 relative",
                                            !isCurrentMonth && "bg-gray-50/20 text-gray-200 opacity-40",
                                            isWeekend && isCurrentMonth && "bg-gray-50/10"
                                        )}
                                    >
                                        <div className="flex justify-start mb-2">
                                            <span className={cn(
                                                "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                                                isToday ? "bg-primary text-white shadow-md scale-105" : "text-gray-400 group-hover:text-gray-900"
                                            )}>
                                                {day.getDate()}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 overflow-hidden">
                                            {events.slice(0, 3).map(event => (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        "text-[9px] px-2 py-1 rounded-md border-l-[3px] shadow-none font-bold uppercase tracking-wider truncate",
                                                        event.color === 'bg-blue-600' ? "bg-blue-50 text-blue-700 border-blue-600" : "bg-green-50 text-green-700 border-green-500"
                                                    )}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="text-[8px] font-bold text-center text-muted-foreground pt-0.5">
                                                    + {events.length - 3} MORE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar - Matching Admin Style */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm bg-white p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Upcoming
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-5">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <div key={event.id} className="group p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-blue-600" /> {event.time}</span>
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3 text-green-500" /> {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No events found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Event Modal - Clean & Professional */}
            <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl bg-white">
                    <div className="bg-gray-50 p-10 border-b border-gray-100">
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-extrabold text-blue-600 tracking-tighter">{selectedDate?.getDate()}</span>
                            <div className="space-y-0.5">
                                <p className="text-xl font-bold text-gray-900 tracking-tight">{selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto bg-white">
                        {selectedDateEvents.map(event => (
                            <div key={event.id} className="p-6 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-5">
                                    <div className={cn("p-3 rounded-xl text-white shadow-sm", event.color)}>
                                        {event.type === 'meeting' ? <Clock className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-bold text-lg text-gray-900 leading-tight">{event.title}</h5>
                                            <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-gray-50 border-gray-100 text-[8px] font-bold uppercase tracking-widest">{event.type}</Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-600" /> {event.time}</span>
                                            {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-red-500" /> {event.location}</span>}
                                        </div>

                                        {event.description && (
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic border-l-2 border-gray-100 pl-3">"{event.description}"</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeCalendar;
