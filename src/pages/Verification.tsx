import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, FileCheck, Loader2, Eye } from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface Verification {
    client_id: number;
    client_name: string;
    completion_date: string;
    status: string;
    pending_count: number;
}

interface CompletedWork {
    id: number;
    client_id: number;
    client_name: string;
    content_type: string;
    completion_date: string;
    verified_by: number;
    verified_by_name?: string;
    verified_at?: string;
    notes?: string;
}

const Verification = () => {
    const navigate = useNavigate();
    const [currentMonthVerifications, setCurrentMonthVerifications] = useState<Verification[]>([]);
    const [previousMonthsVerifications, setPreviousMonthsVerifications] = useState<Verification[]>([]);
    const [completedWork, setCompletedWork] = useState<CompletedWork[]>([]);
    const [showCompletedWork, setShowCompletedWork] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingCompleted, setLoadingCompleted] = useState(false);
    const [stats, setStats] = useState({
        currentMonth: 0,
        previousMonths: 0,
        total: 0,
    });

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.VerificationList);
            console.log('API Response:', response.data);
            
            const { current_month = [], previous_months = [] } = response.data;
            
            setCurrentMonthVerifications(current_month);
            setPreviousMonthsVerifications(previous_months);
            
            // Calculate stats
            const currentMonthCount = current_month.length;
            const previousMonthsCount = previous_months.length;
            
            setStats({
                currentMonth: currentMonthCount,
                previousMonths: previousMonthsCount,
                total: currentMonthCount + previousMonthsCount,
            });
        } catch (error) {
            console.error('Error fetching verifications:', error);
            toast.error('Failed to load verification data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedWork = async () => {
        try {
            setLoadingCompleted(true);
            const response = await axiosInstance.get('api/completed-work/');
            console.log('Completed Work Response:', response.data);
            
            const { completed_work = [] } = response.data;
            setCompletedWork(completed_work);
            setShowCompletedWork(true);
        } catch (error) {
            console.error('Error fetching completed work:', error);
            toast.error('Failed to load completed work');
        } finally {
            setLoadingCompleted(false);
        }
    };

    const handleViewCompletedWork = () => {
        if (!showCompletedWork && completedWork.length === 0) {
            fetchCompletedWork();
        } else {
            setShowCompletedWork(!showCompletedWork);
        }
    };

    const handleViewDetails = (clientId: number) => {
        navigate(`/client-details/${clientId}`);
    };

    const getStatusBadge = (status: string) => {
        if (!status) {
            return <Badge variant="outline">Unknown</Badge>;
        }
        
        switch (status.toLowerCase()) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Verification</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage content verification and client deliverables
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleViewCompletedWork} 
                        variant={showCompletedWork ? "default" : "outline"}
                        className={showCompletedWork ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        {loadingCompleted ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {showCompletedWork ? 'Hide' : 'View'} Completed Work
                    </Button>
                    <Button onClick={fetchVerifications} variant="outline">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Current Month</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.currentMonth}</div>
                        <p className="text-xs text-blue-700">Pending this month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Previous Months</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">{stats.previousMonths}</div>
                        <p className="text-xs text-red-700">Overdue items</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Pending</CardTitle>
                        <FileCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.total}</div>
                        <p className="text-xs text-green-700">All pending items</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content - Current Month */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Current Month Pending
                    </CardTitle>
                    <CardDescription>
                        Clients with pending verifications from this month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading verifications...</p>
                        </div>
                    ) : currentMonthVerifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                            <p className="text-lg font-medium mb-2">No pending verifications</p>
                            <p className="text-sm">All current month content has been verified</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Completion Date</TableHead>
                                    <TableHead>Pending Count</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentMonthVerifications.map((verification, index) => (
                                    <TableRow key={verification.client_id || index}>
                                        <TableCell className="font-medium">
                                            {verification.client_name}
                                        </TableCell>
                                        <TableCell>{new Date(verification.completion_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                {verification.pending_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(verification.client_id)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Main Content - Previous Months (Overdue) */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        Previous Months (Overdue)
                    </CardTitle>
                    <CardDescription>
                        Clients with pending verifications from previous months - requires immediate attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading overdue items...</p>
                        </div>
                    ) : previousMonthsVerifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                            <p className="text-lg font-medium mb-2">No overdue items</p>
                            <p className="text-sm">All previous month content has been verified</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Completion Date</TableHead>
                                    <TableHead>Pending Count</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previousMonthsVerifications.map((verification, index) => (
                                    <TableRow key={verification.client_id || index} className="bg-red-50/50">
                                        <TableCell className="font-medium">
                                            {verification.client_name}
                                        </TableCell>
                                        <TableCell>{new Date(verification.completion_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                                {verification.pending_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                Overdue
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(verification.client_id)}
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Completed Work Section */}
            {showCompletedWork && (
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Completed Work
                        </CardTitle>
                        <CardDescription>
                            All verified content items - videos and posters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingCompleted ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Loading completed work...</p>
                            </div>
                        ) : completedWork.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No completed work</p>
                                <p className="text-sm">No verified content available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Total: <span className="font-semibold text-foreground">{completedWork.length}</span> verified items
                                    </p>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Content Type</TableHead>
                                            <TableHead>Completion Date</TableHead>
                                            <TableHead>Verified By</TableHead>
                                            <TableHead>Verified At</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {completedWork.map((item) => (
                                            <TableRow key={item.id} className="bg-green-50/30">
                                                <TableCell className="font-medium">#{item.id}</TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={() => handleViewDetails(item.client_id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        {item.client_name}
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {item.content_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(item.completion_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {item.verified_by_name || `User #${item.verified_by}`}
                                                </TableCell>
                                                <TableCell>
                                                    {item.verified_at 
                                                        ? new Date(item.verified_at).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {item.notes || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Verification;
