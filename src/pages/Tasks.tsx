import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  CalendarClock,
  AlertCircle,
  Filter,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Target,
  BarChart3,
  Users,
  Clock4,
  CalendarDays,
  Flag,
  Type,
  FileCheck,
  AlertTriangle,
  IdCard
} from 'lucide-react';
import TaskDetailView from '@/components/TaskDetailView';
import AddTaskModal from '@/components/modals/AddTaskModal';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: number;
  assignee_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    designation: string;
    department: string;
    employee_id: string;
    role: string;
    email: string;
    phone_number: string;
  };
  client: number;
  client_details?: {
    id: number;
    client_name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    contract_start_date?: string;
    contract_end_date?: string;
    is_active_client?: boolean;
  };
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  task_type: string;
  task_type_display: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_details?: {
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

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    case 'in_progress':
      return <PlayCircle className="h-5 w-5 text-primary" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-primary" />;
    default:
      return <AlertCircle className="h-5 w-5 text-primary" />;
  }
};

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mainTab, setMainTab] = useState('active');
  const { toast } = useToast();
  const userRole = useSelector((state: RootState) => state.auth.user);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const isAdmin = userRole === 'admin' || userRole === 'superuser';

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = requests.TaskList;
      const response = await axiosInstance.get(endpoint);
      console.log("Tasks API Response:", response.data);
      const data = response.data;

      if (Array.isArray(data)) {
        setTasks(data);
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.results)) {
          setTasks(data.results);
        } else if (Array.isArray(data.data)) {
          setTasks(data.data);
        } else if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          const arrayValue = Object.values(data).find(val => Array.isArray(val));
          if (arrayValue) {
            console.log("Found array in response property, utilizing it.");
            setTasks(arrayValue as Task[]);
          } else {
            console.error('Unexpected API response structure. Keys:', Object.keys(data));
            setTasks([]);
          }
        }
      } else {
        console.error('API response is not an array or object:', typeof data);
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  console.log(tasks, "Tasks data");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTaskDetails = async (taskId: number) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`tasks/task_details/${taskId}/`);
      setSelectedTask(response.data);
      setActiveTab('details');
    } catch (err) {
      console.error('Error fetching task details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load task details',
        variant: 'destructive'
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetails = (task: Task) => {
    fetchTaskDetails(task.id);
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setModalMode('edit');
    setIsAddTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setTaskToEdit(null);
    setModalMode('add');
    setIsAddTaskModalOpen(true);
  };

  const handleTaskCreated = async () => {
    try {
      await fetchTasks();
      setIsAddTaskModalOpen(false);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  const handleTaskUpdated = async () => {
    try {
      await fetchTasks();
      if (selectedTask && taskToEdit && selectedTask.id === taskToEdit.id) {
        fetchTaskDetails(selectedTask.id);
      }
      setIsAddTaskModalOpen(false);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const handleModalClose = () => {
    setIsAddTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await axiosInstance.post(requests.TaskStatusUpdate(taskId), { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, status_display: newStatus.replace('_', ' ') } : t));

      if (selectedTask?.id === taskId) {
        fetchTaskDetails(taskId);
      }

      toast({
        title: 'Success',
        description: 'Task status updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axiosInstance.delete(`tasks/task/${taskId}/delete/`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      if (selectedTask?.id === taskId) {
        handleBackToList();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterPriority]);

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.assignee_details?.full_name?.toLowerCase().includes(searchLower) ||
      task.task_type_display?.toLowerCase().includes(searchLower) ||
      task.client_details?.client_name?.toLowerCase().includes(searchLower)
    ) &&
      (filterStatus === 'all' || task.status.toLowerCase() === filterStatus) &&
      (filterPriority === 'all' || task.priority.toLowerCase() === filterPriority);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (task: Task) => {
    return false;
  };

  const getAssigneeInitials = (task: Task) => {
    if (!task.assignee_details) return 'NA';
    const firstName = task.assignee_details.first_name || '';
    const lastName = task.assignee_details.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'NA';
  };

  const getFullName = (user?: { first_name?: string; last_name?: string; full_name?: string }) => {
    if (!user) return 'Unknown';
    if (user.full_name) return user.full_name;
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
  };

  const StatCard = ({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) => (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-4">Error: {error}</div>
          <Button onClick={fetchTasks}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage daily and monthly schedules for your team
            </p>
          </div>
          {activeTab === 'list' && (
            <div className="flex items-center gap-2">
              <Button
                className="flex items-center gap-2"
                onClick={handleAddTask}
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          )}
          {activeTab === 'details' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBackToList}>
                Back to List
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => selectedTask && handleEditTask(selectedTask)}
              >
                <Edit className="h-4 w-4" />
                Edit Task
              </Button>
            </div>
          )}
        </div>

        {activeTab === 'details' ? (
          <TaskDetailView
            selectedTask={selectedTask}
            detailLoading={detailLoading}
            onBackToList={handleBackToList}
          />
        ) : (
          <Tabs defaultValue="active" value={mainTab} onValueChange={setMainTab} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg px-6 py-2 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  ACTIVE MISSIONS
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-none rounded-full px-2 py-0.5 text-[10px]">
                    {tasks.filter(t => t.status !== 'completed').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archive" className="rounded-lg px-6 py-2 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  ARCHIVES
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700 border-none rounded-full px-2 py-0.5 text-[10px]">
                    {tasks.filter(t => t.status === 'completed').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-3 py-1.5 rounded-lg border border-muted-foreground/10">
                <Clock4 className="h-3 w-3" />
                Automated Categorization
              </div>
            </div>

            <TabsContent value="active" className="mt-0 space-y-6">
              {/* Search and Filters */}
              <Card className="bg-gradient-to-r from-background to-muted/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search tasks by title, description, assignee, or client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-full sm:w-36">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-36">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <Badge variant="secondary" className="px-3 py-1">
                        {filteredTasks.length} tasks
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.filter(t => t.status !== 'completed').length > 0 ? (
                  filteredTasks.filter(t => t.status !== 'completed').map((task) => (
                    <Card key={task.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {getStatusIcon(task.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle
                                className="text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                                title={task.title}
                              >
                                {task.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <span className="text-xs">{task.task_type_display}</span>
                                {task.client_details?.client_name && (
                                  <>
                                    <span className="text-xs">•</span>
                                    <span className="text-xs">{task.client_details.client_name}</span>
                                  </>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description || 'No description provided'}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Priority</span>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority_display}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status_display}
                            </Badge>
                          </div>

                          <Separator />

                          <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getAssigneeInitials(task)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {task.assignee_details?.full_name || 'Unassigned'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {task.assignee_details?.designation || 'No designation'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {formatDate(task.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted/50">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No active missions found.</p>
                  </div>
                )}
              </div>

              {/* Empty States */}
              {filteredTasks.length === 0 && tasks.length > 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No tasks found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tasks.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No tasks yet</p>
                      <p className="text-sm mb-4">Get started by creating your first task</p>
                      <Button onClick={handleAddTask}>
                        Create Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>



            <TabsContent value="archive" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.filter(t => t.status === 'completed').length > 0 ? (
                  filteredTasks.filter(t => t.status === 'completed').map((task) => (
                    <Card key={task.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500/50">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50">
                              {getStatusIcon(task.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle
                                className="text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                                title={task.title}
                              >
                                {task.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <span className="text-xs">{task.task_type_display}</span>
                                {task.client_details?.client_name && (
                                  <>
                                    <span className="text-xs">•</span>
                                    <span className="text-xs">{task.client_details.client_name}</span>
                                  </>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description || 'No description provided'}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Priority</span>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority_display}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status_display}
                            </Badge>
                          </div>

                          <Separator />

                          <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getAssigneeInitials(task)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {task.assignee_details?.full_name || 'Unassigned'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {task.assignee_details?.designation || 'No designation'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-xs">Completed: {task.completed_at || task.updated_at ? formatDate(task.completed_at || task.updated_at) : 'Date Unknown'}</span>
                            </div>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted/50">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-bold">No Archived Missions</p>
                    <p className="text-sm">Completed missions will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      < AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={handleModalClose}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        taskToEdit={taskToEdit}
        mode={modalMode}
      />
    </>
  );
};

export default Tasks;