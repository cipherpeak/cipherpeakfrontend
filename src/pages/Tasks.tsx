import { useState, useEffect } from 'react';
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
  due_date: string;
  scheduled_date: string | null;
  completed_at: string | null;
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
    case 'scheduled':
      return <CalendarClock className="h-5 w-5 text-primary" />;
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
  const { toast } = useToast();

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
        variant: 'destructive'
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
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Task List View */}
          <TabsContent value="list" className="space-y-6 mt-0">
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
                        <SelectItem value="scheduled">Scheduled</SelectItem>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
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
                          <span>Due: {formatDate(task.due_date)}</span>
                        </div>
                        {isOverdue(task) && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

          {/* Task Detail View */}
          <TabsContent value="details" className="mt-0">
            {detailLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading task details...</p>
                </div>
              </div>
            ) : selectedTask ? (
              <div className="space-y-6">
                {/* Task Header */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      <div className="p-4 rounded-lg bg-primary/10">
                        {getStatusIcon(selectedTask.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h1 className="text-3xl font-bold">{selectedTask.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <Type className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg text-muted-foreground">
                                  {selectedTask.task_type_display}
                                </span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg text-muted-foreground">
                                  {selectedTask.priority_display} Priority
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`mt-4 lg:mt-0 text-base py-1.5 px-3 ${getStatusColor(selectedTask.status)}`}>
                            {selectedTask.status_display}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={CalendarDays}
                    label="Due Date"
                    value={formatDate(selectedTask.due_date)}
                  />
                  <StatCard
                    icon={Clock4}
                    label="Created"
                    value={formatDate(selectedTask.created_at)}
                  />
                  <StatCard
                    icon={Flag}
                    label="Priority"
                    value={selectedTask.priority_display}
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Type"
                    value={selectedTask.task_type_display}
                  />
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
                    <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="assignee" className="flex items-center gap-2 py-3">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Assignee</span>
                    </TabsTrigger>
                    <TabsTrigger value="client" className="flex items-center gap-2 py-3">
                      <Building className="h-4 w-4" />
                      <span className="hidden sm:inline">Client</span>
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2 py-3">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Timeline</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Task Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Type className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Task Type</p>
                              <p className="font-medium">{selectedTask.task_type_display}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Flag className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Priority</p>
                              <p className="font-medium">{selectedTask.priority_display}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium">{selectedTask.status_display}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Timeline Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <CalendarDays className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Due Date</p>
                              <p className="font-medium">{formatDateTime(selectedTask.due_date)}</p>
                            </div>
                          </div>
                          {selectedTask.scheduled_date && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <CalendarClock className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                                <p className="font-medium">{formatDateTime(selectedTask.scheduled_date)}</p>
                              </div>
                            </div>
                          )}
                          {selectedTask.completed_at && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <FileCheck className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Completed At</p>
                                <p className="font-medium">{formatDateTime(selectedTask.completed_at)}</p>
                              </div>
                            </div>
                          )}
                          {isOverdue(selectedTask) && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="text-sm text-red-600 font-medium">This task is overdue</p>
                                <p className="text-xs text-red-600">Please complete it as soon as possible</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {selectedTask.description ? (
                            <p className="text-muted-foreground whitespace-pre-wrap">{selectedTask.description}</p>
                          ) : (
                            <p className="text-muted-foreground italic">No description provided</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Assignee Tab */}
                  <TabsContent value="assignee" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Assignee Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedTask.assignee_details ? (
                          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                              <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                {getAssigneeInitials(selectedTask)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <User className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{selectedTask.assignee_details.full_name}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Briefcase className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Designation</p>
                                    <p className="font-medium">{selectedTask.assignee_details.designation}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Building className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="font-medium">{selectedTask.assignee_details.department}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Mail className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedTask.assignee_details.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Phone className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedTask.assignee_details.phone_number || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <IdCard className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Employee ID</p>
                                    <p className="font-medium">{selectedTask.assignee_details.employee_id}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No assignee information available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Client Tab */}
                  <TabsContent value="client" className="space-y-6 mt-6">
                    {selectedTask.client_details ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Client Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Building className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Client Name</p>
                                  <p className="font-medium">{selectedTask.client_details.client_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Company</p>
                                  <p className="font-medium">{selectedTask.client_details.company || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{selectedTask.client_details.email || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="font-medium">{selectedTask.client_details.phone || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              {selectedTask.client_details.address && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">
                                      {selectedTask.client_details.address}
                                      {selectedTask.client_details.city && `, ${selectedTask.client_details.city}`}
                                      {selectedTask.client_details.state && `, ${selectedTask.client_details.state}`}
                                      {selectedTask.client_details.postal_code && `, ${selectedTask.client_details.postal_code}`}
                                      {selectedTask.client_details.country && `, ${selectedTask.client_details.country}`}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {selectedTask.client_details.contract_start_date && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Contract Start</p>
                                    <p className="font-medium">{formatDate(selectedTask.client_details.contract_start_date)}</p>
                                  </div>
                                </div>
                              )}
                              {selectedTask.client_details.contract_end_date && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Contract End</p>
                                    <p className="font-medium">{formatDate(selectedTask.client_details.contract_end_date)}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <p className="font-medium">
                                    {selectedTask.client_details.is_active_client ? 'Active Client' : 'Inactive Client'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No client assigned to this task</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Task Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                              <div className="w-0.5 h-16 bg-green-200 mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Task Created</p>
                              <p className="text-sm text-muted-foreground">
                                by {selectedTask.created_by_details ? getFullName(selectedTask.created_by_details) : 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(selectedTask.created_at)}</p>
                            </div>
                          </div>

                          {selectedTask.scheduled_date && (
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                                <div className="w-0.5 h-16 bg-blue-200 mt-2"></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Task Scheduled</p>
                                <p className="text-sm text-muted-foreground">Scheduled for execution</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(selectedTask.scheduled_date)}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5"></div>
                              <div className="w-0.5 h-16 bg-yellow-200 mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Due Date</p>
                              <p className="text-sm text-muted-foreground">Task deadline</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(selectedTask.due_date)}</p>
                              {isOverdue(selectedTask) && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-2">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>

                          {selectedTask.completed_at && (
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Task Completed</p>
                                <p className="text-sm text-muted-foreground">Successfully finished</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(selectedTask.completed_at)}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-gray-500 rounded-full mt-1.5"></div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Last Updated</p>
                              <p className="text-sm text-muted-foreground">Latest modifications</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(selectedTask.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No task data available</p>
                  <Button onClick={handleBackToList} className="mt-4">
                    Back to Task List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
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