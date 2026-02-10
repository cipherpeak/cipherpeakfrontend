import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2,
    Type,
    Target,
    CalendarDays,
    Clock4,
    Flag,
    BarChart3,
    FileText,
    User,
    Building,
    Clock,
    MapPin,
    Briefcase,
    Mail,
    Phone,
    IdCard,
    FileCheck,
    Calendar,
    CheckCircle2,
    PlayCircle,
    AlertCircle,
    Users
} from 'lucide-react';

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
    is_overdue?: boolean;
    // added missing properties often associated
    created?: string;
    updated?: string;
    commenced_at?: string;
}

interface TaskDetailViewProps {
    selectedTask: Task | null;
    detailLoading: boolean;
    onBackToList: () => void;
}

const TaskDetailView = ({ selectedTask, detailLoading, onBackToList }: TaskDetailViewProps) => {
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

    if (detailLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading task details...</p>
                </div>
            </div>
        );
    }

    if (!selectedTask) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No task data available</p>
                    <Button onClick={onBackToList} className="mt-4">
                        Back to Task List
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
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
                    label="Created"
                    value={formatDate(selectedTask.created_at)}
                />
                <StatCard
                    icon={Clock4}
                    label="Last Updated"
                    value={formatDate(selectedTask.updated_at)}
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
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium">{formatDateTime(selectedTask.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Clock4 className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Updated At</p>
                                        <p className="font-medium">{formatDateTime(selectedTask.updated_at)}</p>
                                    </div>
                                </div>
                                {selectedTask.completed_at && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <FileCheck className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Completed At</p>
                                            <p className="font-medium">{formatDateTime(selectedTask.completed_at)}</p>
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
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                                        <div className="w-0.5 h-16 bg-blue-100 mt-2"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Mission Deployed</p>
                                        <p className="text-xs text-muted-foreground">
                                            by {selectedTask.created_by_details ? getFullName(selectedTask.created_by_details) : 'Admin User'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-full">{formatDateTime(selectedTask.created_at || selectedTask.created)}</p>
                                    </div>
                                </div>

                                {(selectedTask.status === 'in_progress' || selectedTask.status === 'completed') && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                                            <div className="w-0.5 h-16 bg-orange-100 mt-2"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Commenced Work</p>
                                            <p className="text-xs text-muted-foreground">Field work initiated by operative</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-full">{formatDateTime(selectedTask.updated_at || selectedTask.updated || selectedTask.commenced_at || selectedTask.created_at)}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedTask.status === 'completed' ? (
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Mission Accomplished</p>
                                            <p className="text-xs text-muted-foreground">Task successfully verified and archived</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-full">{formatDateTime(selectedTask.completed_at || selectedTask.updated_at || selectedTask.updated || selectedTask.created_at)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-4 opacity-50">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-gray-300 rounded-full mt-1.5"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Awaiting Completion</p>
                                            <p className="text-xs text-muted-foreground italic">Operation in progress or pending</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TaskDetailView;
