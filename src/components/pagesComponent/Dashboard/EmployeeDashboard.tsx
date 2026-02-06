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
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    upcomingLeaves: number;
    attendanceRate: number;
    salaryStatus: string;
}

const EmployeeDashboard = () => {
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EmployeeStats>({
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        upcomingLeaves: 0,
        attendanceRate: 0,
        salaryStatus: 'N/A'
    });
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
    const [salaryDetails, setSalaryDetails] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { toast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, leavesRes, salaryRes] = await Promise.all([
                axiosInstance.get(requests.TaskList),
                axiosInstance.get(requests.LeaveList, { params: { employee: userInfo?.id } }),
                axiosInstance.get(requests.SalaryPaymentList, { params: { employee: userInfo?.id } })
            ]);

            const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.results || []);
            const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : (leavesRes.data.results || []);
            const salaries = Array.isArray(salaryRes.data) ? salaryRes.data : (salaryRes.data.results || []);

            setRecentTasks(tasks.slice(0, 5));
            setUpcomingLeaves(leaves.filter((l: any) => l.status?.toLowerCase() === 'approved').slice(0, 3));
            setSalaryDetails(salaries[0] || null);

            setStats({
                totalTasks: tasks.length,
                pendingTasks: tasks.filter((t: any) => t.status !== 'completed').length,
                completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
                upcomingLeaves: leaves.filter((l: any) => l.status === 'approved').length,
                attendanceRate: 98,
                salaryStatus: salaries[0]?.payment_status || 'Pending'
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
            case 'scheduled': return 'bg-gray-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    useEffect(() => {
        fetchData();
    }, [userInfo]);

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

            {/* Metric Grid - Matching Admin Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tasks"
                    value={stats.pendingTasks}
                    change="-2"
                    changeText="from last week"
                    icon={CheckSquare}
                    color="text-orange-500"
                />
                <StatCard
                    title="Efficiency"
                    value={`${stats.attendanceRate}%`}
                    change="+1.2%"
                    changeText="from last month"
                    icon={Activity}
                    color="text-blue-500"
                />
                <StatCard
                    title="Upcoming Leaves"
                    value={stats.upcomingLeaves}
                    change="0"
                    changeText="this month"
                    icon={CalendarCheck}
                    color="text-red-500"
                />
                <StatCard
                    title="Net Payout"
                    value={salaryDetails?.net_amount ? `₦${Number(salaryDetails.net_amount).toLocaleString()}` : "---"}
                    changeText={salaryDetails?.status_display || "Processing"}
                    icon={Wallet}
                    color="text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks - Matching Admin Style */}
                <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <CheckSquare className="h-5 w-5" />
                            Recent Tasks
                        </CardTitle>
                        <CardDescription>
                            Latest task updates and assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Due {format(new Date(task.due_date), 'MMM dd, yyyy')} • {task.client_details?.client_name || 'Internal'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn("rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider", getPriorityColor(task.priority))}>
                                                {task.priority || 'Medium'}
                                            </Badge>
                                            <Select
                                                value={task.status}
                                                onValueChange={(value) => handleStatusUpdate(task.id, value)}
                                            >
                                                <SelectTrigger className={cn("h-7 w-[110px] text-[10px] font-bold rounded-lg border-none", getStatusColor(task.status))}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-xl">
                                                    <SelectItem value="pending">PENDING</SelectItem>
                                                    <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                                    <SelectItem value="completed">COMPLETED</SelectItem>
                                                </SelectContent>
                                            </Select>
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

                {/* Today's Schedule Sidebar - Matching Admin style */}
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Clock className="h-5 w-5" />
                            Today's Schedule
                        </CardTitle>
                        <CardDescription>
                            Upcoming events and meetings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {/* In a real app, we'd fetch today's specific events */}
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-gray-400 w-14">09:00 AM</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Morning Sync</p>
                                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest text-[9px]">Team Internal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-gray-400 w-14">02:00 PM</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Project Review</p>
                                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest text-[9px]">Client Update</p>
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-dashed border-gray-100">
                                <NavLink to="/calendar">
                                    <Button variant="ghost" className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-xl px-2">
                                        View Full Calendar <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </NavLink>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Matching Admin Progress/Alerts style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <TrendingUp className="h-5 w-5" />
                            Project Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span>Tasks Completed</span>
                                <span>{Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%</span>
                            </div>
                            <Progress value={(stats.completedTasks / (stats.totalTasks || 1)) * 100} className="h-2 rounded-full" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span>Monthly Target</span>
                                <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2 rounded-full bg-gray-100" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <AlertCircle className="h-5 w-5" />
                            System Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-orange-900">Update required</p>
                                    <p className="text-xs text-orange-700 font-medium">Please update your task estimates by end of day.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-green-900">Sync successful</p>
                                    <p className="text-xs text-green-700 font-medium">Your payroll data has been synchronized.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, changeText, icon: Icon, color }: any) => {
    const isPositive = change?.startsWith('+');

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
                <p className="text-[11px] font-bold mt-1">
                    {change && (
                        <span className={cn(isPositive ? "text-green-600" : "text-red-500", "mr-1")}>
                            {change}
                        </span>
                    )}
                    <span className="text-muted-foreground">{changeText}</span>
                </p>
            </CardContent>
        </Card>
    );
};

export default EmployeeDashboard;
