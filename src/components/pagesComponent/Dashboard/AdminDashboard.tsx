import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    UserCheck,
    CheckSquare,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle,
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats] = useState([
        { title: 'Total Employees', value: '24', change: '+2', icon: Users, color: 'text-primary' },
        { title: 'Active Clients', value: '18', change: '+3', icon: UserCheck, color: 'text-success' },
        { title: 'Pending Tasks', value: '12', change: '-4', icon: CheckSquare, color: 'text-warning' },
        { title: 'Today\'s Events', value: '5', change: '+1', icon: Calendar, color: 'text-danger' },
    ]);

    const [recentTasks] = useState([
        {
            id: 1,
            title: "Social Media Strategy",
            assignee_details: { full_name: "Jane Smith" },
            status: "In Progress",
            priority: "High",
        },
        {
            id: 2,
            title: "Content Creation",
            assignee_details: { full_name: "Mike Wilson" },
            status: "Pending",
            priority: "Medium",
        },
        {
            id: 3,
            title: "Client Meeting",
            assignee_details: { full_name: "Admin User" },
            status: "Scheduled",
            priority: "High",
        },
        {
            id: 4,
            title: "Website Audit",
            assignee_details: { full_name: "Sarah Jones" },
            status: "Completed",
            priority: "Low",
        },
        {
            id: 5,
            title: "Email Campaign",
            assignee_details: { full_name: "Mike Wilson" },
            status: "In Progress",
            priority: "Medium",
        },
    ]);

    const [upcomingEvents] = useState([
        { time: "10:00 AM", title: "Team Sync", type: "Internal Meeting" },
        { time: "01:30 PM", title: "Client Pitch", type: "Meeting" },
        { time: "03:00 PM", title: "Project Review", type: "Review" },
        { time: "04:30 PM", title: "Daily Wrap-up", type: "Sync" },
    ]);

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
                {stats.map((stat) => (
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
                                <span className="text-success">{stat.change}</span> from last month
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
                    </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Today's Schedule
                        </CardTitle>
                        <CardDescription>
                            Upcoming events and meetings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-muted-foreground w-12">
                                        {event.time}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{event.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Project Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Website Redesign</span>
                                <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Mobile App Development</span>
                                <span>45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Database Migration</span>
                                <span>90%</span>
                            </div>
                            <Progress value={90} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            System Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Server maintenance scheduled</p>
                                    <p className="text-xs text-muted-foreground">Tomorrow at 2:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                                <CheckSquare className="h-4 w-4 text-success mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Backup completed successfully</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
