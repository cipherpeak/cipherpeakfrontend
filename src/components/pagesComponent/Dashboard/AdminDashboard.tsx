import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import {
    Users,
    UserCheck,
    CheckSquare,
    Calendar,
    Clock,
    ArrowRight,
} from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';
import { format, isToday } from 'date-fns';

interface DashboardStats {
    totalEmployees: number;
    activeClients: number;
    pendingTasks: number;
    todaysEvents: number;
}

interface Task {
    id: number;
    title: string;
    assignee_details?: { full_name: string };
    status: string;
    priority: string;
}

interface Event {
    id: number;
    title: string;
    event_type: string;
    start_date: string;
    start_time?: string;
}

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeClients: 0,
        pendingTasks: 0,
        todaysEvents: 0,
    });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [employeesRes, clientsRes, tasksRes, eventsRes] = await Promise.all([
                axiosInstance.get(requests.EmployeeList),
                axiosInstance.get(requests.ClientList),
                axiosInstance.get(requests.TaskList),
                axiosInstance.get(requests.EventList),
            ]);

            // Helper function to unwrap API responses
            const unwrapResponse = (data: any): any[] => {
                if (Array.isArray(data)) {
                    return data;
                } else if (typeof data === 'object' && data !== null) {
                    // Check common wrapper patterns
                    if (Array.isArray(data.results)) return data.results;
                    if (Array.isArray(data.data)) return data.data;
                    // Find any array property
                    const arrayValue = Object.values(data).find(val => Array.isArray(val));
                    if (arrayValue) return arrayValue as any[];
                }
                return [];
            };

            // Unwrap all responses
            const employees = unwrapResponse(employeesRes.data);
            const clients = unwrapResponse(clientsRes.data);
            const tasks = unwrapResponse(tasksRes.data);
            const rawEvents = unwrapResponse(eventsRes.data);

            // Normalize event data (API uses 'name' and 'event_date')
            const normalizedEvents = rawEvents.map((evt: any) => ({
                id: evt.id,
                title: evt.name || evt.title || 'Untitled Event',
                event_type: evt.event_type_display || evt.event_type || 'Event',
                start_date: evt.event_date || evt.start_date || evt.date,
                start_time: evt.start_time || '00:00'
            }));

            // Count active employees
            const activeEmployees = employees.filter(
                (emp: any) => emp.current_status !== 'inactive' && emp.current_status !== 'terminated'
            ).length;

            setStats({
                totalEmployees: activeEmployees,
                activeClients: clients.filter((c: any) => c.status === 'active').length,
                pendingTasks: tasks.filter((t: any) => ['pending', 'in_progress', 'scheduled'].includes(t.status)).length,
                todaysEvents: normalizedEvents.filter(e => isToday(new Date(e.start_date))).length,
            });

            // Recent tasks
            setRecentTasks([...tasks]
                .sort((a: any, b: any) => new Date(b.created_at || b.due_date).getTime() - new Date(a.created_at || a.due_date).getTime())
                .slice(0, 5)
            );

            // Today's events
            setUpcomingEvents(normalizedEvents
                .filter(e => isToday(new Date(e.start_date)))
                .sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'))
                .slice(0, 4)
            );

            // Upcoming future events
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            setAllUpcomingEvents(normalizedEvents
                .filter(e => {
                    const eDate = new Date(e.start_date);
                    eDate.setHours(0, 0, 0, 0);
                    return eDate.getTime() > today.getTime();
                })
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .slice(0, 5)
            );
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-danger text-danger-foreground';
            case 'medium': return 'bg-warning text-warning-foreground';
            case 'low': return 'bg-success text-success-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-success text-success-foreground';
            case 'in progress': return 'bg-primary text-primary-foreground';
            case 'pending': return 'bg-warning text-warning-foreground';
            case 'scheduled': return 'bg-muted text-muted-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        try {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    const statsCards = [
        { title: 'Total Employees', value: stats.totalEmployees.toString(), icon: Users, color: 'text-primary' },
        { title: 'Active Clients', value: stats.activeClients.toString(), icon: UserCheck, color: 'text-success' },
        { title: 'Pending Tasks', value: stats.pendingTasks.toString(), icon: CheckSquare, color: 'text-warning' },
        { title: 'Today\'s Events', value: stats.todaysEvents.toString(), icon: Calendar, color: 'text-danger' },
    ];

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-3xl">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase tracking-widest text-xs opacity-50 mb-2">Loading...</h1>
                        <h2 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">Admin Command</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-20 bg-muted/50"></CardHeader>
                            <CardContent className="h-16 bg-muted/30"></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-3xl">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase tracking-widest text-xs opacity-50 mb-2">Operational Overview</h1>
                    <h2 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">Admin Command</h2>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statsCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                Real-time data
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5" />
                            Recent Tasks
                        </CardTitle>
                        <CardDescription>
                            Latest task updates and assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No tasks found</p>
                        ) : (
                            <div className="space-y-4">
                                {recentTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium text-foreground">{task.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Assigned to {task.assignee_details?.full_name || 'Unassigned'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={getPriorityColor(task.priority)}
                                            >
                                                {task.priority}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={getStatusColor(task.status)}
                                            >
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Schedule & Upcoming Column */}
                <div className="space-y-6">
                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Today's Schedule
                                </CardTitle>
                                <CardDescription>
                                    Today's events and meetings
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No events today</p>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    {upcomingEvents.map((event) => (
                                        <div key={event.id} className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-muted-foreground w-20">
                                                {formatTime(event.start_time || '00:00')}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">{event.event_type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Button variant="ghost" size="sm" asChild className="w-full mt-4">
                                <Link to="/calendar" className="flex items-center justify-center gap-1">
                                    View More
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Upcoming Events Section (Full Width) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Upcoming Events
                        </CardTitle>
                        <CardDescription>Events for the coming days</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {allUpcomingEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {allUpcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-4 border border-border rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all hover:shadow-md border-l-4 border-l-primary"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                            {event.event_type}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(event.start_date), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(event.start_time || '00:00')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button variant="ghost" size="sm" asChild className="w-full mt-4">
                        <Link to="/calendar" className="flex items-center justify-center gap-1">
                            View More
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>


        </div>
    );
};

export default AdminDashboard;
