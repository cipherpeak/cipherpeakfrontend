import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Download,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface LeaveRequest {
    id: number;
    employeeName: string;
    employeeId: string;
    category: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    reason: string;
    address_during_leave: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
    attachment?: string;
    comments?: string;
    reviewedBy?: string;
    reviewDate?: string;
}

interface LeaveDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveRequest | null;
    isAdmin: boolean;
    onStatusUpdate: () => void;
}

const LeaveDetailsModal = ({
    isOpen,
    onClose,
    leave,
    isAdmin,
    onStatusUpdate
}: LeaveDetailsModalProps) => {
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();

    if (!leave) return null;

    const handleProcessLeave = async (status: 'approved' | 'rejected') => {
        if (!remarks.trim() && status === 'rejected') {
            toast({
                title: 'Remarks Required',
                description: 'Please provide remarks when rejecting a leave request.',
                variant: 'destructive',
            });
            return;
        }

        setProcessing(true);
        try {
            await axiosInstance.post(requests.LeaveProcess(leave.id), {
                status,
                remarks
            });

            toast({
                title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `The leave request has been successfully ${status}.`,
            });
            onStatusUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error processing leave:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to process leave request',
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP');
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Leave Request Details</DialogTitle>
                        {getStatusBadge(leave.status)}
                    </div>
                    <DialogDescription>
                        Review the details of the leave application
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Employee</Label>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{leave.employeeName}</span>
                                <span className="text-xs text-muted-foreground">({leave.employeeId})</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Duration</Label>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{leave.totalDays} Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                            <div className="p-2 bg-muted/50 rounded-md">
                                <span className="text-sm">{leave.category}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Address During Leave</Label>
                            <div className="p-2 bg-muted/50 rounded-md">
                                <span className="text-sm">{leave.address_during_leave || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Applied On</Label>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(leave.appliedDate)}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reason</Label>
                            <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                                <p className="text-sm text-muted-foreground italic">"{leave.reason}"</p>
                            </div>
                        </div>

                        {leave.attachment && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Attachment</Label>
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9" asChild>
                                    <a href={leave.attachment} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4" />
                                        View Document
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {leave.reviewedBy && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-md border border-muted">
                        <h4 className="text-sm font-medium mb-2">Review Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Reviewed By:</span>
                                <span className="ml-2 font-medium">{leave.reviewedBy}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Date:</span>
                                <span className="ml-2 font-medium">{formatDate(leave.reviewDate || '')}</span>
                            </div>
                            {leave.comments && (
                                <div className="col-span-2 mt-1">
                                    <span className="text-muted-foreground">Comments:</span>
                                    <p className="mt-1 text-muted-foreground">{leave.comments}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isAdmin && leave.status === 'pending' && (
                    <div className="mt-6 space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Admin Remarks *</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter remarks for approval or rejection..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="destructive"
                                onClick={() => handleProcessLeave('rejected')}
                                disabled={processing}
                                className="gap-2"
                            >
                                {processing ? <Clock className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleProcessLeave('approved')}
                                disabled={processing}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {processing ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                Approve
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LeaveDetailsModal;
