import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    CheckSquare,
    Calendar,
    Clock,
    Loader2,
    CalendarDays,
    Sun,
    Moon,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    TrendingUp,
    Wallet,
    CalendarCheck,
    FileText,
    Activity,
    ChevronRight,
    AlertCircle,
    UserCheck,
    Users,
    Coffee,
    Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeStats {
    activeTasks: number;
    pendingTasks: number;
    totalLeavesTaken: number;
    leaveBalance: number;
}

interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    type: string;
    status: string;
}

const EmployeeDashboard = () => {
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EmployeeStats>({
        activeTasks: 0,
        pendingTasks: 0,
        totalLeavesTaken: 0,
        leaveBalance: 0
    });
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [salaryDetails, setSalaryDetails] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { toast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        if (!userInfo?.id) return;
        setLoading(true);
        try {
            const [tasksRes, leavesRes, eventsRes] = await Promise.all([
                axiosInstance.get(requests.TaskList),
                axiosInstance.get(requests.LeaveList, { params: { employee: userInfo?.id } }),
                axiosInstance.get(requests.EventList)
            ]);

            const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.results || []);
            const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : (leavesRes.data.results || []);
            const fetchedEvents = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.results || []);

            setRecentTasks(tasks.slice(0, 3));

            // Process events
            const formattedEvents = fetchedEvents.map((evt: any) => {
                const eventDate = evt.event_date || evt.date;
                let timeStr = evt.start_time || evt.time;

                // If time is missing, derive it from event_date
                if (!timeStr && eventDate) {
                    try {
                        timeStr = format(new Date(eventDate), 'hh:mm a');
                    } catch {
                        timeStr = '12:00 AM';
                    }
                }

                // Ensure time has a space for splitting in the UI (e.g., "10:00 AM")
                if (timeStr && !timeStr.includes(' ')) {
                    try {
                        // Assuming format like "10:00:00" or "10:00"
                        const [h, m] = timeStr.split(':');
                        const date = new Date();
                        date.setHours(parseInt(h), parseInt(m));
                        timeStr = format(date, 'hh:mm a');
                    } catch {
                        // Keep as is or fallback
                    }
                }

                return {
                    id: evt.id,
                    title: evt.name || evt.title || 'Untitled Event',
                    description: evt.description || '',
                    date: eventDate,
                    time: timeStr || '12:00 AM',
                    duration: evt.duration || '1h',
                    type: evt.event_type_display || evt.event_type || evt.type || 'Event',
                    status: evt.status
                };
            });
            setEvents(formattedEvents);

            // Calculate leave stats
            // Filter leaves for the current employee if the API returns all leaves (depends on backend)
            // Assuming LeaveList returns current user's leaves due to previous context or filter
            const myLeaves = leaves;

            const leaveBalances = [
                { category: 'Annual Leave', total: 18 },
                { category: 'Casual Leave', total: 12 },
                { category: 'Sick Leave', total: 6 },
                { category: 'LOP', total: 5 },
                { category: 'Bereavement Leave', total: 3 },
            ].map(b => {
                const used = myLeaves
                    .filter((l: any) => l.category === b.category && l.status === 'approved')
                    .reduce((sum: number, l: any) => sum + (Number(l.total_days || l.totalDays) || 0), 0);
                return { ...b, used, remaining: Math.max(0, b.total - used) };
            });

            const totalUsed = leaveBalances.reduce((acc, curr) => acc + curr.used, 0);
            const totalRemaining = leaveBalances.reduce((acc, curr) => acc + curr.remaining, 0);

            setStats({
                activeTasks: tasks.filter((t: any) => t.status === 'in_progress').length,
                pendingTasks: tasks.filter((t: any) => t.status === 'pending').length,
                totalLeavesTaken: totalUsed,
                leaveBalance: totalRemaining
            });
        } catch (err) {
            console.error('Error fetching employee dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId: number, newStatus: string) => {
        try {
            await axiosInstance.post(requests.TaskStatusUpdate(taskId), { status: newStatus });
            setRecentTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, status_display: newStatus.replace('_', ' ') } : t));

            toast({
                title: 'Success',
                description: 'Task status updated successfully',
            });
            fetchData();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update task status',
                variant: 'destructive'
            });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-500 text-white';
            case 'medium': return 'bg-orange-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-500 text-white';
            case 'in_progress':
            case 'in progress': return 'bg-blue-600 text-white';
            case 'pending': return 'bg-orange-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    const formatSafeDate = (dateString: string | null | undefined, formatStr: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, formatStr);
    };

    useEffect(() => {
        if (userInfo?.id) {
            fetchData();
        } else {
            const timer = setTimeout(() => {
                if (!userInfo?.id) setLoading(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [userInfo?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Preparing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section matches Admin but tailored to employee */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here's an overview of your activities and status.
                    </p>
                </div>
                {/* {userInfo && (
                    <NavLink to="/camera-team">
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                            <Camera className="h-4 w-4" />
                            Camera Team
                        </Button>
                    </NavLink>
                )} */}
            </div>

            {/* Metric Grid - Tailored for Employee */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Task Card"
                    value={stats.activeTasks}
                    icon={Activity}
                    color="text-blue-500"
                    description="Tasks currently in progress"
                />
                <StatCard
                    title="Pending Task Card"
                    value={stats.pendingTasks}
                    icon={Clock}
                    color="text-orange-500"
                    description="Tasks waiting to be started"
                />
                <StatCard
                    title="Total Leaves Taken"
                    value={stats.totalLeavesTaken}
                    icon={Calendar}
                    color="text-purple-500"
                    description="Days used this year"
                />
                <StatCard
                    title="Leave Balance"
                    value={stats.leaveBalance}
                    icon={Wallet}
                    color="text-green-500"
                    description="Days remaining available"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <CheckSquare className="h-5 w-5" />
                                Recent Tasks
                            </CardTitle>
                            <CardDescription>
                                Latest missions and assignments
                            </CardDescription>
                        </div>
                        <NavLink to="/tasks">
                            <Button variant="ghost" className="text-primary hover:text-primary/80">
                                View More <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </NavLink>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors pointer-events-none">{task.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Due {formatSafeDate(task.due_date || task.created_at, 'MMM dd')} • {task.priority} Priority
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn(
                                                "rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                getStatusColor(task.status)
                                            )}>
                                                {task.status_display || task.status}
                                            </Badge>
                                            <NavLink to="/tasks">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </NavLink>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                    <Coffee className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium">No tasks assigned at the moment.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule & Events */}
                <div className="space-y-6">
                    {/* Today's Schedule */}
                    <Card className="border border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Today's Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {events.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length > 0 ? (
                                    events.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).map(event => (
                                        <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white border border-blue-100 shadow-sm">
                                                <span className="text-xs font-bold text-blue-600">{(event.time || '').split(' ')[0] || '--:--'}</span>
                                                <span className="text-[10px] text-blue-400">{(event.time || '').split(' ')[1] || ''}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{event.type}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p className="text-sm">No events scheduled for today</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="border border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <CalendarDays className="h-5 w-5 text-purple-500" />
                                Upcoming Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {events.filter(e => new Date(e.date) > new Date()).slice(0, 3).length > 0 ? (
                                    events.filter(e => new Date(e.date) > new Date()).slice(0, 3).map(event => (
                                        <div key={event.id} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">{formatSafeDate(event.date, 'MMM dd')} • {event.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p className="text-sm">No upcoming events</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, description }: any) => {
    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight text-gray-900">{value}</div>
                {description && (
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default EmployeeDashboard;
