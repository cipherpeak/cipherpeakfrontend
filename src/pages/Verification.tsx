import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, FileCheck, Loader2 } from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface Verification {
    id: number;
    client: number;
    client_name?: string;
    content_type: string;
    video_count: number;
    poster_count: number;
    completion_date: string;
    verified_by: number;
    verified_by_name?: string;
    status: string;
    notes?: string;
}

const Verification = () => {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        verified: 0,
        pending: 0,
        rejected: 0,
        total: 0,
    });

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.VerificationList);
            const data = response.data;
            
            setVerifications(data);
            
            // Calculate stats
            const verified = data.filter((v: Verification) => v.status === 'verified').length;
            const pending = data.filter((v: Verification) => v.status === 'pending').length;
            const rejected = data.filter((v: Verification) => v.status === 'rejected').length;
            
            setStats({
                verified,
                pending,
                rejected,
                total: data.length,
            });
        } catch (error) {
            console.error('Error fetching verifications:', error);
            toast.error('Failed to load verification data');
        } finally {
            setLoading(false);
        }
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
                <Button onClick={fetchVerifications} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Verified</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.verified}</div>
                        <p className="text-xs text-green-700">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        <p className="text-xs text-yellow-700">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
                        <p className="text-xs text-red-700">Needs revision</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Total</CardTitle>
                        <FileCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        <p className="text-xs text-blue-700">All submissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Verification</CardTitle>
                    <CardDescription>
                        Review and verify client content submissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading verifications...</p>
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No verification data available</p>
                            <p className="text-sm">Content verification system is ready to use</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Content Type</TableHead>
                                    <TableHead>Videos</TableHead>
                                    <TableHead>Posters</TableHead>
                                    <TableHead>Completion Date</TableHead>
                                    <TableHead>Verified By</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {verifications.map((verification) => (
                                    <TableRow key={verification.id}>
                                        <TableCell className="font-medium">
                                            {verification.client_name || `Client #${verification.client}`}
                                        </TableCell>
                                        <TableCell className="capitalize">{verification.content_type}</TableCell>
                                        <TableCell>{verification.video_count}</TableCell>
                                        <TableCell>{verification.poster_count}</TableCell>
                                        <TableCell>{new Date(verification.completion_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {verification.verified_by_name || `User #${verification.verified_by}`}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Verification;
