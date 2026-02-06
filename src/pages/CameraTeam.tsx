import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import {
    Camera,
    Video,
    Plus,
    Link as LinkIcon,
    Calendar,
    MoreVertical,
    ExternalLink,
    Filter,
    Search,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface CameraProject {
    id: number;
    client_name: string;
    file_path: string;
    uploaded_date: string;
    priority: 'high' | 'medium' | 'low' | 'urgent';
    link: string;
    created_at: string;
    client?: number; // Store client ID for creation
}

interface Client {
    id: number;
    client_name: string;
    is_active_client?: boolean;
}

const CameraTeam = () => {
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    console.log('Current User Info:', userInfo); // DEBUG: Check user role/type
    const [projects, setProjects] = useState<CameraProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newProject, setNewProject] = useState({
        client_name: '',
        file_path: '',
        uploaded_date: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium',
        link: ''
    });

    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const response = await axiosInstance.get(requests.ClientList);
            // The API might return results in a nested structure based on previous logs
            const data = response.data;
            if (Array.isArray(data)) {
                setClients(data);
            } else if (data.results && Array.isArray(data.results)) {
                setClients(data.results);
            } else if (data.data && Array.isArray(data.data)) {
                setClients(data.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients list');
        } finally {
            setIsLoadingClients(false);
        }
    };

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.CameraDepartmentList);
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchClients();
        fetchProjects();
    }, []);

    const handleAddProject = async () => {
        if (!newProject.client_name || !newProject.file_path) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Find client ID
        const selectedClient = clients.find(c => c.client_name === newProject.client_name);
        if (!selectedClient) {
            toast.error('Invalid client selected');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                client: selectedClient.id,
                file_path: newProject.file_path,
                uploaded_date: newProject.uploaded_date,
                priority: newProject.priority,
                link: newProject.link
            };

            await axiosInstance.post(requests.CameraDepartmentCreate, payload);
            toast.success('Project created successfully');

            // Refresh list and reset form
            fetchProjects();
            setNewProject({
                client_name: '',
                file_path: '',
                uploaded_date: format(new Date(), 'yyyy-MM-dd'),
                priority: 'medium',
                link: ''
            });
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id: number) => {
        try {
            await axiosInstance.delete(requests.CameraDepartmentDetail(id));
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge className="bg-red-500 hover:bg-red-600 text-white uppercase text-[10px] font-bold px-2 py-0.5">Urgent</Badge>;
            case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white uppercase text-[10px] font-bold px-2 py-0.5">High</Badge>;
            case 'medium': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white uppercase text-[10px] font-bold px-2 py-0.5">Medium</Badge>;
            case 'low': return <Badge className="bg-slate-500 hover:bg-slate-600 text-white uppercase text-[10px] font-bold px-2 py-0.5">Low</Badge>;
            default: return <Badge variant="secondary" className="uppercase text-[10px] font-bold px-2 py-0.5">{priority}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Camera className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shooted Clips</h1>
                    </div>
                    <p className="text-slate-500 mt-2 font-medium">Coordinate and manage visual content production pipeline.</p>
                </div>
            </div>

            {/* Inline Add Project Form */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Project Link
                    </h2>
                </div>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">File Path *</Label>
                            <Input
                                placeholder="C:\Users\Username\Desktop\your_projects\project"
                                className="rounded-xl border-slate-200 h-11 focus:ring-primary/20"
                                value={newProject.file_path}
                                onChange={(e) => setNewProject({ ...newProject, file_path: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client Name *</Label>
                            <Select
                                value={newProject.client_name}
                                onValueChange={(value) => setNewProject({ ...newProject, client_name: value })}
                            >
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20">
                                    <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select client"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl overflow-y-auto max-h-[300px]">
                                    {clients.length > 0 ? (
                                        clients.map((client) => (
                                            <SelectItem key={client.id} value={client.client_name}>
                                                {client.client_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No active clients</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority *</Label>
                            <Select
                                value={newProject.priority}
                                onValueChange={(value) => setNewProject({ ...newProject, priority: value })}
                            >
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="low">Low Priority</SelectItem>
                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                    <SelectItem value="high">High Priority</SelectItem>
                                    <SelectItem value="urgent">Urgent Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded Date *</Label>
                            <Input
                                type="date"
                                className="rounded-xl border-slate-200 h-11 focus:ring-primary/20"
                                value={newProject.uploaded_date}
                                onChange={(e) => setNewProject({ ...newProject, uploaded_date: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drive Link</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="https://drive.google.com/..."
                                    className="pl-10 rounded-xl border-slate-200 h-11 focus:ring-primary/20"
                                    value={newProject.link}
                                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={handleAddProject}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-12 font-black shadow-lg shadow-primary/20 h-11"
                            disabled={!newProject.client_name || !newProject.file_path}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content Section */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Video className="h-5 w-5 text-primary" />
                            Department Projects
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search projects..."
                                    className="pl-10 h-10 w-[240px] rounded-xl bg-white border-slate-200 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                <Filter className="h-4 w-4 text-slate-600" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-600 py-4 pl-6">Client Name</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4">File Path</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4">Uploaded Date</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4">Priority</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4">Drive Link</TableHead>
                                    <TableHead className="text-right py-4 pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell className="font-bold text-slate-800 py-4 pl-6">{project.client_name}</TableCell>
                                        <TableCell className="text-slate-600 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary italic">
                                                    FP
                                                </div>
                                                <span className="truncate max-w-[200px]" title={project.file_path}>
                                                    {project.file_path}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {format(new Date(project.uploaded_date), 'MMM dd, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getPriorityBadge(project.priority)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {project.link ? (
                                                <a
                                                    href={project.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                                                >
                                                    <LinkIcon className="h-3 w-3" />
                                                    View Assets
                                                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic font-medium">No link provided</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors" title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-amber-50 text-amber-500 hover:text-amber-600 transition-colors" title="Edit Project">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-lg h-8 w-8 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                                                    title="Delete Project"
                                                    onClick={() => handleDeleteProject(project.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CameraTeam;
