import { useState } from 'react';
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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import AddEventModal from '@/components/modals/AddEventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  const events = [
    {
      id: 1,
      title: 'Team Standup',
      description: 'Daily team synchronization meeting',
      date: '2024-01-15',
      time: '09:00',
      duration: '30 min',
      type: 'Meeting',
      attendees: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Mike Wilson', initials: 'MW' },
      ],
      color: 'bg-primary',
    },
    {
      id: 2,
      title: 'Client Presentation',
      description: 'Present Q1 proposal to ABC Corp',
      date: '2024-01-15',
      time: '11:30',
      duration: '2 hours',
      type: 'Presentation',
      attendees: [
        { name: 'Sarah Connor', initials: 'SC' },
        { name: 'David Lee', initials: 'DL' },
      ],
      color: 'bg-success',
    },
    {
      id: 3,
      title: 'Project Review',
      description: 'Review website redesign progress',
      date: '2024-01-15',
      time: '14:00',
      duration: '1 hour',
      type: 'Review',
      attendees: [
        { name: 'Mike Wilson', initials: 'MW' },
        { name: 'Emma Brown', initials: 'EB' },
      ],
      color: 'bg-warning',
    },
    {
      id: 4,
      title: 'HR Interview',
      description: 'Interview candidate for frontend position',
      date: '2024-01-16',
      time: '10:00',
      duration: '1 hour',
      type: 'Interview',
      attendees: [
        { name: 'Sarah Connor', initials: 'SC' },
        { name: 'John Doe', initials: 'JD' },
      ],
      color: 'bg-danger',
    },
    {
      id: 5,
      title: 'Sprint Planning',
      description: 'Plan upcoming sprint activities',
      date: '2024-01-17',
      time: '13:00',
      duration: '2 hours',
      type: 'Planning',
      attendees: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Mike Wilson', initials: 'MW' },
        { name: 'David Lee', initials: 'DL' },
      ],
      color: 'bg-primary',
    },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
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
    return events.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting': return 'bg-primary text-primary-foreground';
      case 'presentation': return 'bg-success text-success-foreground';
      case 'review': return 'bg-warning text-warning-foreground';
      case 'interview': return 'bg-danger text-danger-foreground';
      case 'planning': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const todaysEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage events and schedules for your organization
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddEventModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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
              {/* Calendar Grid - Responsive */}
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
                      className={`bg-card p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] border-r border-b border-border ${
                        !isCurrentMonth(day) ? 'opacity-50' : ''
                      } ${isToday(day) ? 'bg-primary/10' : ''}`}
                    >
                      <div
                        className={`text-xs sm:text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, window.innerWidth < 640 ? 1 : 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                          >
                            <span className="hidden sm:inline">{event.time} </span>
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > (window.innerWidth < 640 ? 1 : 2) && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - (window.innerWidth < 640 ? 1 : 2)} more
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

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysEvents.length > 0 ? (
                <div className="space-y-3">
                  {todaysEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <div className="flex -space-x-1">
                          {event.attendees.slice(0, 3).map((attendee, index) => (
                            <Avatar key={index} className="h-5 w-5 border border-background">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {attendee.initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {event.attendees.length > 3 && (
                            <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                              +{event.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-semibold">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Meetings</span>
                <span className="font-semibold">
                  {events.filter(e => e.type === 'Meeting').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Presentations</span>
                <span className="font-semibold">
                  {events.filter(e => e.type === 'Presentation').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reviews</span>
                <span className="font-semibold">
                  {events.filter(e => e.type === 'Review').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <AddEventModal 
      open={isAddEventModalOpen} 
      onOpenChange={setIsAddEventModalOpen} 
    />
    </>
  );
};

export default Calendar;