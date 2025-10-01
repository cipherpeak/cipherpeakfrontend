import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Calendar, Clock, User, Filter } from 'lucide-react';
import AddTaskModal from '@/components/modals/AddTaskModal';

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const tasks = [
    {
      id: 1,
      title: 'Update client proposal for Q1',
      description: 'Revise the proposal based on client feedback and include new pricing structure',
      assignee: {
        name: 'John Doe',
        initials: 'JD',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'High',
      status: 'In Progress',
      dueDate: '2024-01-15',
      createdAt: '2024-01-10',
      tags: ['Client Work', 'Proposal'],
    },
    {
      id: 2,
      title: 'Review quarterly reports',
      description: 'Analyze Q4 performance data and prepare summary for stakeholders',
      assignee: {
        name: 'Jane Smith',
        initials: 'JS',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2024-01-20',
      createdAt: '2024-01-08',
      tags: ['Reports', 'Analysis'],
    },
    {
      id: 3,
      title: 'Prepare team meeting agenda',
      description: 'Create agenda for monthly team meeting and send invitations',
      assignee: {
        name: 'Mike Wilson',
        initials: 'MW',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'Low',
      status: 'Completed',
      dueDate: '2024-01-12',
      createdAt: '2024-01-05',
      tags: ['Meeting', 'Planning'],
    },
    {
      id: 4,
      title: 'Client onboarding call',
      description: 'Schedule and conduct onboarding call with new client ABC Corp',
      assignee: {
        name: 'Sarah Connor',
        initials: 'SC',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'High',
      status: 'Scheduled',
      dueDate: '2024-01-18',
      createdAt: '2024-01-12',
      tags: ['Client Work', 'Onboarding'],
    },
    {
      id: 5,
      title: 'Database optimization',
      description: 'Optimize database queries and improve system performance',
      assignee: {
        name: 'David Lee',
        initials: 'DL',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2024-01-25',
      createdAt: '2024-01-10',
      tags: ['Technical', 'Performance'],
    },
    {
      id: 6,
      title: 'Marketing campaign review',
      description: 'Review current marketing campaigns and suggest improvements',
      assignee: {
        name: 'Emma Brown',
        initials: 'EB',
        avatar: '/placeholder-avatar.jpg'
      },
      priority: 'Low',
      status: 'Pending',
      dueDate: '2024-01-22',
      createdAt: '2024-01-11',
      tags: ['Marketing', 'Review'],
    },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || task.priority.toLowerCase() === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status.toLowerCase().replace(' ', '') === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-danger text-danger-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in progress': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => 
      status === 'all' ? true : task.status.toLowerCase().replace(' ', '') === status
    );
  };

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
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks by title, description, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
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
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending ({getTasksByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="inprogress" className="text-xs sm:text-sm">
            Progress ({getTasksByStatus('inprogress').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs sm:text-sm">
            Scheduled ({getTasksByStatus('scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Done ({getTasksByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {getTasksByStatus('pending').map((task) => (
            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </TabsContent>

        <TabsContent value="inprogress" className="space-y-4">
          {getTasksByStatus('inprogress').map((task) => (
            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {getTasksByStatus('scheduled').map((task) => (
            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getTasksByStatus('completed').map((task) => (
            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </TabsContent>
      </Tabs>
    </div>

    <AddTaskModal 
      open={isAddTaskModalOpen} 
      onOpenChange={setIsAddTaskModalOpen} 
    />
    </>
  );
};

interface TaskCardProps {
  task: any;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}

const TaskCard = ({ task, getPriorityColor, getStatusColor, formatDate }: TaskCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-4">
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
        <div className="flex-1">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-2">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-sm mb-3">
            {task.description}
          </CardDescription>
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Change Status</DropdownMenuItem>
            <DropdownMenuItem>Reassign</DropdownMenuItem>
            <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-sm text-muted-foreground">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {task.assignee.initials}
              </AvatarFallback>
            </Avatar>
            <span>{task.assignee.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Tasks;