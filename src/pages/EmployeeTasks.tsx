import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Loader2,
    Calendar,
    Clock,
    FileText,
    Briefcase,
    CheckCircle2,
    PlayCircle,
    CalendarClock,
    AlertCircle,
    ArrowRight,
    Target,
    Zap,
    CheckCircle,
    LayoutGrid,
    ListIcon,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Layout
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { format } from 'date-fns';

interface Task {
    id: number;
    title: string;
    description: string;
    assignee: number;
    priority: string;
    priority_display: string;
    status: string;
    status_display: string;
    due_date: string;
    created_at: string;
    updated_at: string;
    scheduled_date: string | null;
    completed_at: string | null;
    task_type_display?: string;
    client_details?: {
        client_name: string;
    };
}

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'details'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const { toast } = useToast();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(requests.TaskList);
            const data = response.data;
            setTasks(Array.isArray(data) ? data : (data.results || []));
        } catch (err: any) {
            toast({
                title: 'Error',
                description: 'Failed to load tasks',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo?.id) {
            fetchTasks();
        } else {
            const timer = setTimeout(() => {
                if (!userInfo?.id) setLoading(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [userInfo?.id]);

    const handleStatusUpdate = async (taskId: number, newStatus: string) => {
        try {
            await axiosInstance.post(requests.TaskStatusUpdate(taskId), { status: newStatus });
            toast({
                title: 'Status Updated',
                description: `Task status changed to ${newStatus.replace('_', ' ')}`,
            });
            fetchTasks();
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, status: newStatus, status_display: newStatus.replace('_', ' ') } : null);
            }
        } catch (err: any) {
            toast({
                title: 'Update Failed',
                description: 'Failed to update task status',
                variant: 'destructive',
            });
        }
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
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

    if (loading && tasks.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section matching Dashboard style */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Missions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your assigned tasks and operational goals.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total', value: stats.total, icon: Target, color: 'text-gray-400' },
                    { label: 'Active', value: stats.inProgress, icon: Zap, color: 'text-blue-500' },
                    { label: 'Cleared', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Queued', value: stats.pending, icon: CalendarClock, color: 'text-orange-500' }
                ].map((stat, i) => (
                    <Card key={i} className="border border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                <TabsContent value="list" className="space-y-6">
                    {/* Controls Bar - Light Style */}
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search missions..."
                                className="pl-11 h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all shadow-none font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl">
                            <Button
                                variant={viewMode === 'grid' ? 'white' : 'ghost'}
                                size="sm"
                                className={cn("rounded-lg h-9 w-10 p-0 shadow-none hover:bg-white", viewMode === 'grid' && "bg-white shadow-sm font-bold")}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'white' : 'ghost'}
                                size="sm"
                                className={cn("rounded-lg h-9 w-10 p-0 shadow-none hover:bg-white", viewMode === 'list' && "bg-white shadow-sm font-bold")}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Mission Grid/List */}
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className={cn(
                                        "group relative border border-gray-100 bg-white hover:border-blue-100 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden",
                                        viewMode === 'grid' ? "rounded-2xl" : "rounded-xl border-l-4 border-l-transparent hover:border-l-blue-500"
                                    )}
                                    onClick={() => { setSelectedTask(task); setActiveTab('details'); }}
                                >
                                    {viewMode === 'grid' ? (
                                        <CardContent className="p-5 flex flex-col h-full">
                                            {/* Header: Priority & Status */}
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge variant="secondary" className={cn("px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-opacity-10 text-gray-600 bg-gray-100")}>
                                                    {task.priority_display}
                                                </Badge>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={(value) => handleStatusUpdate(task.id, value)}
                                                    >
                                                        <SelectTrigger className={cn("h-6 w-auto gap-2 px-2 text-[10px] font-bold rounded-full border-none focus:ring-0", getStatusColor(task.status))}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                            <SelectItem value="pending">PENDING</SelectItem>
                                                            <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                                            <SelectItem value="completed">COMPLETED</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Body: Title & Description */}
                                            <div className="space-y-2 mb-6 flex-1">
                                                <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {task.description}
                                                </p>
                                            </div>

                                            {/* Footer: Meta & Action */}
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</span>
                                                        <span className="text-xs font-semibold text-gray-700">{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                </div>

                                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    ) : (
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={cn("w-1 h-12 rounded-full", getPriorityColor(task.priority).replace('text-white', ''))} />

                                                <div className="space-y-1 min-w-[200px]">
                                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Briefcase className="h-3 w-3" />
                                                        <span>{task.task_type_display || 'General'}</span>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-8 hidden md:block">
                                                    {task.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-end min-w-[100px]">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due</span>
                                                    <span className="text-xs font-bold text-gray-700">{format(new Date(task.due_date), 'MMM dd')}</span>
                                                </div>

                                                <div onClick={(e) => e.stopPropagation()} className="min-w-[120px]">
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={(value) => handleStatusUpdate(task.id, value)}
                                                    >
                                                        <SelectTrigger className={cn("h-7 w-full text-[10px] font-bold rounded-lg border-none focus:ring-0", getStatusColor(task.status))}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                            <SelectItem value="pending">PENDING</SelectItem>
                                                            <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                                            <SelectItem value="completed">COMPLETED</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                                <p className="text-muted-foreground font-medium">No missions found matching your search.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Details View - Clean & Structured */}
                <TabsContent value="details" className="pt-2">
                    {selectedTask ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setActiveTab('list')}
                                        className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedTask.title}</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            {selectedTask.task_type_display || 'Operational Mission'} • ID #{selectedTask.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={cn("rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest", getStatusColor(selectedTask.status))}>
                                        {selectedTask.status_display.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold">Mission Briefing</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 leading-relaxed font-medium">
                                                {selectedTask.description}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold">Timeline</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                                <div className="relative">
                                                    <div className="absolute -left-[32px] top-1.5 w-4 h-4 bg-blue-500 border-4 border-white rounded-full shadow-sm ring-4 ring-blue-50"></div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">DEPLOYED</p>
                                                        <p className="font-bold text-gray-900">{format(new Date(selectedTask.created_at), 'MMMM dd, yyyy HH:mm')}</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[32px] top-1.5 w-4 h-4 bg-red-500 border-4 border-white rounded-full shadow-sm ring-4 ring-red-50"></div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">CRITICAL DEADLINE</p>
                                                        <p className="font-bold text-gray-900">{format(new Date(selectedTask.due_date), 'MMMM dd, yyyy HH:mm')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card className="rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                        <CardHeader className="bg-gray-50/50">
                                            <CardTitle className="text-lg font-bold">Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Override Status</label>
                                                <Select
                                                    value={selectedTask.status}
                                                    onValueChange={(value) => handleStatusUpdate(selectedTask.id, value)}
                                                >
                                                    <SelectTrigger className={cn("h-12 rounded-xl text-xs font-bold border-gray-100", getStatusColor(selectedTask.status))}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                                        <SelectItem value="pending">PENDING</SelectItem>
                                                        <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                                        <SelectItem value="completed">COMPLETED</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Intensity</p>
                                                    <p className="font-bold text-gray-900 text-sm">{selectedTask.priority_display}</p>
                                                </div>
                                                <div className={cn("h-8 w-1 rounded-full", getPriorityColor(selectedTask.priority))}></div>
                                            </div>

                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                    <Target className="h-4 w-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Client Asset</span>
                                                </div>
                                                <p className="font-bold text-blue-900 text-sm">{selectedTask.client_details?.client_name || 'Organization Internal'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EmployeeTasks;
