import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    MapPin,
    Phone,
    Mail,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Loader2,
    Download,
    Filter,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    FileSpreadsheet,
    PlayCircle,
    CalendarClock,
    Eye,
    Paperclip
} from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface LeaveApplication {
    id: number;
    employee: number;
    employee_name: string;
    employee_details?: {
        first_name: string;
        last_name: string;
        employee_id: string;
        department?: string;
        branch?: string;
        mobile?: string;
        email?: string;
        profile_picture?: string;
        designation?: string;
    };
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    address_during_leave?: string;
    passport_required_from?: string;
    passport_required_to?: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'upcoming';
    applied_date: string;
    approved_by?: number;
    approved_by_name?: string;
    approved_at?: string;
    remarks?: string;
    attachment?: string;
    monthly_leave_count?: number;
}

const LeaveApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<LeaveApplication[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);

    // Rejection modal state
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionRemarks, setRejectionRemarks] = useState('');
    const [applicationToReject, setApplicationToReject] = useState<number | null>(null);

    useEffect(() => {
        fetchApplications();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axiosInstance.get(requests.EmployeeList);
            const employeesData = Array.isArray(response.data) ? response.data : response.data.employees || [];
            setEmployees(employeesData.map((emp: any) => ({
                id: emp.id,
                name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.username
            })));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (employeeFilter !== 'all') params.employee = employeeFilter;
            if (leaveTypeFilter !== 'all') params.leave_type = leaveTypeFilter;

            console.log('Fetching applications with params:', params);
            const response = await axiosInstance.get(requests.AdminLeaveList, { params });
            console.log('Applications response:', response.data);
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to fetch leave applications');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReject = async (applicationId: number, action: 'approve' | 'reject', remarks?: string) => {
        try {
            setProcessing(true);
            await axiosInstance.post(requests.AdminLeaveProcess(applicationId), {
                action: action,
                remarks: remarks || ''
            });
            toast.success(`Leave ${action}d successfully`);
            setSelectedApplication(null);
            setRejectionModalOpen(false);
            setRejectionRemarks('');
            setApplicationToReject(null);
            fetchApplications();
        } catch (error) {
            console.error(`Error ${action}ing leave:`, error);
            toast.error(`Failed to ${action} leave`);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'pending': 'bg-orange-50 text-orange-500',
            'approved': 'bg-green-50 text-green-500',
            'rejected': 'bg-red-50 text-red-500',
            'active': 'bg-cyan-50 text-cyan-500',
            'upcoming': 'bg-blue-50 text-blue-500'
        };
        return styles[status] || 'bg-gray-50 text-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading applications...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-50' },
        { label: 'Approved', value: applications.filter(a => ['approved', 'active', 'upcoming'].includes(a.status)).length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Total', value: applications.length, icon: FileSpreadsheet, color: 'text-gray-500', bg: 'bg-gray-50' },
        { label: 'Active', value: applications.filter(a => a.status === 'active').length, icon: PlayCircle, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        { label: 'Upcoming', value: applications.filter(a => a.status === 'upcoming').length, icon: CalendarClock, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="space-y-6">
            {selectedApplication ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => setSelectedApplication(null)} className="h-9 px-4 rounded-lg bg-white border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-tight shadow-sm hover:bg-gray-50">
                                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                                Back to List
                            </Button>
                            <h1 className="text-lg font-bold text-[#1e1e1e]">Leave Application Details</h1>
                        </div>
                        {selectedApplication.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleApproveReject(selectedApplication.id, 'approve')}
                                    disabled={processing}
                                    className="bg-[#2e7d32] hover:bg-[#2e7d32]/90 text-white rounded-lg px-6 h-9 text-[11px] font-bold shadow-sm"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => {
                                        setApplicationToReject(selectedApplication.id);
                                        setRejectionModalOpen(true);
                                    }}
                                    disabled={processing}
                                    variant="destructive"
                                    className="bg-[#d32f2f] hover:bg-[#d32f2f]/90 text-white rounded-lg px-6 h-9 text-[11px] font-bold shadow-sm"
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Leave Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-sm rounded-xl">
                                <CardHeader className="pb-2 relative">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-bold text-[#1e1e1e]">Leave Information</h2>
                                        <Badge className={`${getStatusStyle(selectedApplication.status)} border-none px-3 py-1 rounded-full text-[10px] font-bold`}>
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-4">
                                    {/* Leave Type & Duration */}
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Leave Type</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#e0f7f9] flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="h-5 w-5 text-[#26c6da]" />
                                                </div>
                                                <span className="text-sm font-bold text-[#333]">{selectedApplication.leave_type}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Duration</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="h-5 w-5 text-[#42a5f5]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#333]">{selectedApplication.total_days} days</p>
                                                    <p className="text-[10px] font-medium text-gray-400">
                                                        {formatDate(selectedApplication.start_date)} to {formatDate(selectedApplication.end_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Leave Count */}
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Monthly Leave Count</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-[#e8f5e9] flex items-center justify-center shrink-0">
                                                <div className="w-7 h-7 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                                                    <span className="text-[11px] font-bold text-[#4caf50]">
                                                        {selectedApplication.monthly_leave_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-[#333]">
                                                {selectedApplication.monthly_leave_count || 0} leaves in
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Start Date</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="h-5 w-5 text-[#42a5f5]" />
                                                </div>
                                                <span className="text-sm font-bold text-[#333]">{formatDate(selectedApplication.start_date)}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">End Date</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="h-5 w-5 text-[#42a5f5]" />
                                                </div>
                                                <span className="text-sm font-bold text-[#333]">{formatDate(selectedApplication.end_date)}</span>
                                            </div>
                                        </div>
                                    </div>



                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Reason for Leave</p>
                                            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/30 min-h-[50px]">
                                                <p className="text-[13px] text-gray-600 font-medium">{selectedApplication.reason}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Address During Leave</p>
                                            <div className="p-3.5 rounded-lg border-gray-200 bg-gray-50/30 min-h-[50px]">
                                                <p className="text-[13px] text-gray-600 font-medium">{selectedApplication.address_during_leave || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Attachment Section */}
                            <Card className="border-none shadow-sm rounded-xl">
                                <CardHeader className="pb-2">
                                    <h2 className="text-sm font-bold text-[#1e1e1e]">Supporting Documents</h2>
                                </CardHeader>
                                <CardContent className="pt-2 pb-6">
                                    {selectedApplication.attachment ? (
                                        <div className="flex items-center gap-4 p-4 bg-[#f8fbff] rounded-lg border border-[#edf3f9]">
                                            <div className="w-10 h-10 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5 text-[#42a5f5]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-bold text-[#333]">
                                                    {selectedApplication.attachment.split('/').pop()}
                                                </p>
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight">
                                                    Attached Document
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => window.open(selectedApplication.attachment, '_blank')}
                                                className="bg-[#2e7d32] hover:bg-[#2e7d32]/90 text-white rounded-lg px-6 h-9 text-[11px] font-bold shadow-sm"
                                            >
                                                <Download className="h-3.5 w-3.5 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50/20 border-gray-100">
                                            <div className="flex flex-col items-center gap-2">
                                                <Paperclip className="h-8 w-8 text-gray-300" />
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">No supporting documents attached</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Panel - Employee Information & Timeline */}
                        <div className="space-y-6">
                            {/* Employee Information */}
                            <Card className="border-none shadow-sm rounded-xl relative">
                                <CardHeader className="pb-2 flex-row items-center justify-between">
                                    <h2 className="text-sm font-bold text-[#1e1e1e]">Employee Information</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[#42a5f5] border-[#42a5f5] hover:bg-blue-50 px-3 rounded-md text-[10px] font-bold bg-white"
                                        onClick={() => navigate('/employees', { state: { openEmployeeId: selectedApplication.employee } })}
                                    >
                                        <User className="h-3 w-3 mr-1.5" />
                                        View Details
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 px-6 pb-6">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-3">
                                            <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
                                                <AvatarImage src={selectedApplication.employee_details?.profile_picture} />
                                                <AvatarFallback className="bg-[#1a237e] text-white text-xl font-bold">
                                                    {selectedApplication.employee_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="font-bold text-base text-[#1e1e1e] mb-0.5">{selectedApplication.employee_name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                            {selectedApplication.employee_details?.employee_id || 'ID N/A'}
                                        </p>
                                        <Badge variant="secondary" className="bg-[#e3f2fd] text-[#42a5f5] hover:bg-[#e3f2fd] border-none px-4 py-0.5 rounded-full font-bold text-[10px]">
                                            {selectedApplication.employee_details?.department || 'Not Set'}
                                        </Badge>
                                    </div>

                                    <div className="mt-8 space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                <User className="h-3.5 w-3.5 text-[#42a5f5]" />
                                            </div>
                                            <p className="text-[12px] font-bold text-[#333]">
                                                <span className="text-gray-400 font-medium mr-2">Type:</span>
                                                {selectedApplication.employee_details?.designation || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                <MapPin className="h-3.5 w-3.5 text-[#42a5f5]" />
                                            </div>
                                            <p className="text-[12px] font-bold text-[#333]">
                                                <span className="text-gray-400 font-medium mr-2">Department:</span>
                                                {selectedApplication.employee_details?.department || 'Not Set'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                <Phone className="h-3.5 w-3.5 text-[#42a5f5]" />
                                            </div>
                                            <p className="text-[12px] font-bold text-[#333]">
                                                <span className="text-gray-400 font-medium mr-2">Mobile:</span>
                                                {selectedApplication.employee_details?.mobile || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                <Mail className="h-3.5 w-3.5 text-[#42a5f5]" />
                                            </div>
                                            <p className="text-[12px] font-bold text-[#333] truncate">
                                                <span className="text-gray-400 font-medium mr-2">Email:</span>
                                                {selectedApplication.employee_details?.email || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Application Timeline */}
                            <Card className="border-none shadow-sm rounded-xl mt-6">
                                <CardHeader className="pb-2">
                                    <h2 className="text-sm font-bold text-[#1e1e1e]">Application Timeline</h2>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-6 pb-8">
                                    <div className="relative flex gap-4">
                                        {/* Connector Line */}
                                        <div className="absolute left-4 top-8 bottom-[-20px] w-0.5 bg-gray-100 -z-10"></div>

                                        <div className="w-8 h-8 rounded-lg bg-[#2e7d32] flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-[#1e1e1e]">Application Submitted</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                {formatDate(selectedApplication.applied_date)}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400">
                                                {new Date(selectedApplication.applied_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedApplication.status === 'pending' ? (
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-lg border-[1.5px] border-[#ffa000] flex items-center justify-center shrink-0 bg-white">
                                                <div className="w-4 h-4 text-[#ffa000] flex items-center justify-center">
                                                    <Clock className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[12px] font-bold text-[#1e1e1e]">Pending Approval</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight">Awaiting admin review</p>
                                                <div className="w-full bg-[#f1f1f1] h-[3px] rounded-full mt-2.5 overflow-hidden">
                                                    <div className="w-[70%] bg-[#ffa000] h-full rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${['approved', 'active', 'upcoming'].includes(selectedApplication.status) ? 'bg-[#2e7d32]' : 'bg-[#d32f2f]'}`}>
                                                {['approved', 'active', 'upcoming'].includes(selectedApplication.status) ? <CheckCircle2 className="h-4 w-4 text-white" /> : <XCircle className="h-4 w-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-bold text-[#1e1e1e]">
                                                    {['approved', 'active', 'upcoming'].includes(selectedApplication.status) ? 'Approved' : 'Rejected'} by {selectedApplication.approved_by_name || 'Admin'}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                    {selectedApplication.approved_at ? formatDate(selectedApplication.approved_at) : 'N/A'}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400">
                                                    {selectedApplication.approved_at ? new Date(selectedApplication.approved_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                                {selectedApplication.remarks && (
                                                    <p className="text-[11px] text-gray-500 mt-1 italic">"{selectedApplication.remarks}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-[#1e1e1e]">Leave Applications</h1>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white border-gray-200 text-gray-600 font-bold text-xs uppercase shadow-sm">
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Export
                        </Button>
                    </div>

                    {/* Filter Bar */}
                    <Card className="border-none shadow-sm rounded-xl">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 gap-4 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">From Date</label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="h-9 rounded-lg border-gray-100 text-xs font-bold bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">To Date</label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="h-9 rounded-lg border-gray-100 text-xs font-bold bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 lg:col-span-1">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Employee</label>
                                    <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                                        <SelectTrigger className="h-9 rounded-lg border-gray-100 text-xs font-bold bg-white">
                                            <SelectValue placeholder="All Employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employees</SelectItem>
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-9 rounded-lg border-gray-100 text-xs font-bold bg-white">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Leave Type</label>
                                    <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                                        <SelectTrigger className="h-9 rounded-lg border-gray-100 text-xs font-bold bg-white">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                            <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                            <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                                            <SelectItem value="LOP">LOP</SelectItem>
                                            <SelectItem value="WFH">WFH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 lg:col-span-2">
                                    <Button
                                        onClick={fetchApplications}
                                        className="h-9 bg-[#007bff] hover:bg-[#007bff]/90 text-white rounded-lg flex-1 text-xs font-bold shadow-sm"
                                    >
                                        <Filter className="h-3.5 w-3.5 mr-2" />
                                        Filter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setFromDate('');
                                            setToDate('');
                                            setStatusFilter('all');
                                            setEmployeeFilter('all');
                                            setLeaveTypeFilter('all');
                                            fetchApplications();
                                        }}
                                        className="h-9 rounded-lg border-gray-200 text-gray-600 font-bold text-xs uppercase shadow-sm"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="border-none shadow-sm rounded-xl py-4 flex flex-col items-center justify-center gap-2">
                                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-[#1e1e1e] leading-none mb-1">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Table View */}
                    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fcfcfc] border-b border-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Employee</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Leave Details</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Type</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Duration</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">Applied On</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                                                        <XCircle className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800">No leave applications found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={app.employee_details?.profile_picture} />
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                                                                {app.employee_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#1e1e1e]">{app.employee_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400">{app.employee_details?.employee_id || 'ID N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-bold text-[#333] mb-0.5">Applied on {formatDate(app.applied_date)}</p>
                                                    <p className="text-[10px] font-medium text-gray-400">Duration: {formatDate(app.start_date)} to {formatDate(app.end_date)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-bold text-[#333]">{app.leave_type}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-bold text-[#333]">{app.total_days} days</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${getStatusStyle(app.status)} border-none shadow-none rounded-full px-3 py-1 font-bold text-[10px] hover:bg-opacity-80`}>
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-bold text-[#333] mb-0.5">{formatDate(app.applied_date)}</p>
                                                    <p className="text-[10px] font-medium text-gray-400">
                                                        {new Date(app.applied_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-lg border-gray-100 text-blue-500 bg-white hover:bg-blue-50 shadow-sm"
                                                            onClick={() => setSelectedApplication(app)}
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {app.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 rounded-lg border-gray-100 text-green-600 bg-white hover:bg-green-50 shadow-sm"
                                                                    onClick={() => handleApproveReject(app.id, 'approve')}
                                                                    disabled={processing}
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 rounded-lg border-gray-100 text-red-600 bg-white hover:bg-red-50 shadow-sm"
                                                                    onClick={() => {
                                                                        setApplicationToReject(app.id);
                                                                        setRejectionModalOpen(true);
                                                                    }}
                                                                    disabled={processing}
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                </>
            )}

            {/* Reject Leave Modal */}
            <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="text-lg font-bold text-[#1e1e1e]">Reject Leave Application</DialogTitle>
                        <DialogDescription className="text-[13px] text-gray-500 font-medium">
                            Please provide a reason for rejecting this leave application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                Reason for Rejection *
                            </Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter reason for rejection..."
                                value={rejectionRemarks}
                                onChange={(e) => setRejectionRemarks(e.target.value)}
                                className="min-h-[120px] resize-none border-gray-200 focus:border-[#d32f2f] focus:ring-[#d32f2f]/10 rounded-xl text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-start gap-3 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100 mt-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-orange-700 leading-relaxed">
                                Note: This action cannot be undone. The employee will be notified of the rejection.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-5 bg-gray-50/50 gap-3 border-t border-gray-100 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectionModalOpen(false);
                                setRejectionRemarks('');
                                setApplicationToReject(null);
                            }}
                            className="h-10 px-6 rounded-xl border-gray-200 text-gray-600 font-bold text-xs uppercase shadow-sm hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => applicationToReject && handleApproveReject(applicationToReject, 'reject', rejectionRemarks)}
                            disabled={processing || !rejectionRemarks.trim()}
                            className="h-10 px-8 bg-[#d32f2f] hover:bg-[#d32f2f]/90 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3.5 w-3.5 mr-2" />
                                    Reject Leave
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LeaveApplications;
