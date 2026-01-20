import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, 
    Video, 
    Image, 
    CheckCircle2, 
    Clock, 
    Loader2,
    Calendar,
    User,
    CheckCircle
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/axios/axios';
import { toast } from 'sonner';

interface ContentItem {
    id: number;
    content_type: string;
    completion_date: string;
    verified_by: number | null;
    verified_by_name?: string;
    verified_at?: string;
    notes?: string;
}

interface ClientDetailsData {
    client_id: number;
    client_name: string;
    videos: ContentItem[];
    posters: ContentItem[];
    total_pending: number;
    total_verified: number;
}

const ClientDetails = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clientData, setClientData] = useState<ClientDetailsData | null>(null);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

    useEffect(() => {
        if (clientId) {
            fetchClientDetails();
        }
    }, [clientId]);

    const fetchClientDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`api/client-details/${clientId}/`);
            console.log('Client Details Response:', response.data);
            setClientData(response.data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            toast.error('Failed to load client details');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsVerified = (item: ContentItem) => {
        setSelectedItem(item);
        setShowConfirmDialog(true);
    };

    const confirmMarkAsVerified = async () => {
        if (!selectedItem) return;

        try {
            setVerifyingId(selectedItem.id);
            await axiosInstance.post('api/mark-verified/', {
                verification_id: selectedItem.id
            });
            
            toast.success('Content marked as verified successfully');
            setShowConfirmDialog(false);
            setSelectedItem(null);
            
            // Refresh the data
            await fetchClientDetails();
        } catch (error: any) {
            console.error('Error marking as verified:', error);
            toast.error(error.response?.data?.message || 'Failed to mark content as verified');
        } finally {
            setVerifyingId(null);
        }
    };

    const getVerificationBadge = (item: ContentItem) => {
        if (item.verified_by) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
        }
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderContentTable = (items: ContentItem[], contentType: string) => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No {contentType} content available</p>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Verified By</TableHead>
                        <TableHead>Verified At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">#{item.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDate(item.completion_date)}
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.verified_by_name ? (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {item.verified_by_name}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">Not verified</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {item.verified_at ? formatDate(item.verified_at) : '-'}
                            </TableCell>
                            <TableCell>{getVerificationBadge(item)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                                {item.notes || '-'}
                            </TableCell>
                            <TableCell>
                                {!item.verified_by ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMarkAsVerified(item)}
                                        disabled={verifyingId === item.id}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        {verifyingId === item.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Mark as Verified
                                    </Button>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Verified</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading client details...</p>
                </div>
            </div>
        );
    }

    if (!clientData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-lg font-medium mb-4">Client not found</p>
                    <Button onClick={() => navigate('/verification')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Verification
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/verification')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{clientData.client_name}</h1>
                        <p className="text-muted-foreground mt-1">
                            Client ID: {clientData.client_id}
                        </p>
                    </div>
                </div>
                <Button onClick={fetchClientDetails} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Verified</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{clientData.total_verified}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-900">{clientData.total_pending}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Videos</CardTitle>
                        <Video className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{clientData.videos.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Posters</CardTitle>
                        <Image className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900">{clientData.posters.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Verification Details</CardTitle>
                    <CardDescription>
                        View all content items and their verification status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="videos" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="videos" className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Videos ({clientData.videos.length})
                            </TabsTrigger>
                            <TabsTrigger value="posters" className="flex items-center gap-2">
                                <Image className="h-4 w-4" />
                                Posters ({clientData.posters.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="videos" className="mt-6">
                            {renderContentTable(clientData.videos, 'video')}
                        </TabsContent>

                        <TabsContent value="posters" className="mt-6">
                            {renderContentTable(clientData.posters, 'poster')}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this content as verified? This action will record your verification.
                            {selectedItem && (
                                <div className="mt-4 p-3 bg-muted rounded-md">
                                    <p className="text-sm font-medium">Content ID: #{selectedItem.id}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Completion Date: {formatDate(selectedItem.completion_date)}
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={verifyingId !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmMarkAsVerified}
                            disabled={verifyingId !== null}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {verifyingId !== null ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                'Confirm'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ClientDetails;
