import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    XCircle,
    Clock,
    Loader2,
    CheckCircle,
    Calendar as CalendarIcon,
    ChevronUp,
    ChevronDown,
    Eye,
    ExternalLink,
    Trash2,
    Edit,
    AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface Verification {
    client_id: number;
    client_name: string;
    poster_quota: number;
    video_quota: number;
    posted_posters: number;
    posted_videos: number;
    is_verified: boolean;
    industry: string | null;
    has_overdue: boolean;
}

interface PostedContent {
    id: number;
    client: number;
    client_name: string;
    content_type: 'poster' | 'video';
    content_type_display: string;
    title: string;
    description: string;
    posted_date: string;
    platform: string | null;
    platform_display: string | null;
    content_url: string | null;
    status: 'draft' | 'posted' | 'approved' | 'rejected';
    status_display: string;
    verified_by: number | null;
    verified_by_name: string | null;
    verified_date: string | null;
    verification_notes: string | null;
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

interface ClientDetails {
    client_id: number;
    client_name: string;
    month: number;
    year: number;
    statistics: {
        posters_posted: number;
        videos_posted: number;
        posters_quota: number;
        videos_quota: number;
        is_verified: boolean;
    };
    posted_content: PostedContent[];
    total_count: number;
}

const Verification = () => {
    const [currentMonthVerifications, setCurrentMonthVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Client details modal
    const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Add content modal
    const [addContentOpen, setAddContentOpen] = useState(false);
    const [selectedForAdd, setSelectedForAdd] = useState<{ clientId: number, contentType: 'poster' | 'video' } | null>(null);

    // Delete confirmation
    const [contentToDelete, setContentToDelete] = useState<PostedContent | null>(null);

    // Stats
    const [stats, setStats] = useState({
        totalClients: 0,
        verifiedClients: 0,
        incompleteClients: 0,
        totalPostedPosters: 0,
        totalPostedVideos: 0,
    });

    useEffect(() => {
        fetchVerifications();
    }, [selectedDate]);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.verificationDashboard, {
                params: {
                    month: selectedDate.month,
                    year: selectedDate.year
                }
            });

            const data = response.data;
            setCurrentMonthVerifications(data);

            // Calculate stats
            const verifiedClients = data.filter((v: Verification) => v.is_verified).length;
            const totalPostedPosters = data.reduce((sum: number, v: Verification) => sum + v.posted_posters, 0);
            const totalPostedVideos = data.reduce((sum: number, v: Verification) => sum + v.posted_videos, 0);

            setStats({
                totalClients: data.length,
                verifiedClients,
                incompleteClients: data.length - verifiedClients,
                totalPostedPosters,
                totalPostedVideos,
            });

        } catch (error) {
            console.error('Error fetching verifications:', error);
            toast.error('Failed to load verification dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPostedContent = async (clientId: number, contentType: 'poster' | 'video') => {
        try {
            await axiosInstance.post(requests.addPostedContent, {
                client_id: clientId,
                content_type: contentType,
                month: selectedDate.month,
                year: selectedDate.year
            });

            await fetchVerifications();
            toast.success(`${contentType === 'poster' ? 'Poster' : 'Video'} added successfully`);
        } catch (error: any) {
            console.error('Error adding posted content:', error);
            toast.error(error.response?.data?.error || `Failed to add ${contentType}`);
        }
    };

    const handleRemovePostedContent = async (clientId: number, contentType: 'poster' | 'video') => {
        try {
            await axiosInstance.post(requests.removePostedContent, {
                client_id: clientId,
                content_type: contentType,
                month: selectedDate.month,
                year: selectedDate.year
            });

            await fetchVerifications();
            toast.success(`${contentType === 'poster' ? 'Poster' : 'Video'} removed`);
        } catch (error: any) {
            console.error('Error removing posted content:', error);
            toast.error(error.response?.data?.error || `Failed to remove ${contentType}`);
        }
    };

    const handleVerifyClient = async (clientId: number, clientName: string) => {
        try {
            const response = await axiosInstance.post(requests.verifyClient, {
                client_id: clientId,
                month: selectedDate.month,
                year: selectedDate.year
            });

            await fetchVerifications();
            toast.success(`${clientName} verified successfully!`);
        } catch (error: any) {
            console.error('Error verifying client:', error);
            const errorMsg = error.response?.data?.error || 'Failed to verify client';
            const details = error.response?.data?.details;

            if (details) {
                toast.error(`${errorMsg}. Need ${details.posters_needed} more posters, ${details.videos_needed} more videos.`);
            } else {
                toast.error(errorMsg);
            }
        }
    };

    const fetchClientDetails = async (clientId: number) => {
        try {
            setDetailsLoading(true);
            const response = await axiosInstance.get(`${requests.clientContent}/${clientId}/`, {
                params: {
                    month: selectedDate.month,
                    year: selectedDate.year
                }
            });
            setSelectedClient(response.data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            toast.error('Failed to load client details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDeleteContent = async () => {
        if (!contentToDelete) return;

        try {
            await axiosInstance.delete(`${requests.deletePostedContent}/${contentToDelete.id}/`);

            // Refresh both dashboard and details
            await fetchVerifications();
            if (selectedClient) {
                await fetchClientDetails(selectedClient.client_id);
            }

            toast.success('Content deleted successfully');
            setContentToDelete(null);
        } catch (error) {
            console.error('Error deleting content:', error);
            toast.error('Failed to delete content');
        }
    };

    const handleAddCustomContent = async (formData: any) => {
        if (!selectedForAdd) return;

        try {
            await axiosInstance.post(requests.addPostedContent, {
                client_id: selectedForAdd.clientId,
                content_type: selectedForAdd.contentType,
                month: selectedDate.month,
                year: selectedDate.year,
                ...formData
            });

            await fetchVerifications();
            setAddContentOpen(false);
            setSelectedForAdd(null);
            toast.success('Content added successfully');
        } catch (error: any) {
            console.error('Error adding custom content:', error);
            toast.error(error.response?.data?.error || 'Failed to add content');
        }
    };

    const TableHeaderRow = () => (
        <TableRow className="bg-gray-100">
            <TableHead className="text-black font-semibold border-r border-gray-300">Client Name</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300 text-center">Poster(Total)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300 text-center">Video(Total)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300 text-center">Poster (pst)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300 text-center">Video(pst)</TableHead>
            <TableHead className="text-black font-semibold text-center">Actions</TableHead>
        </TableRow>
    );

    const DataTableRow = ({ verification, index }: { verification: Verification; index: number }) => {
        const postersRemaining = Math.max(0, verification.poster_quota - verification.posted_posters);
        const videosRemaining = Math.max(0, verification.video_quota - verification.posted_videos);

        return (
            <TableRow
                key={verification.client_id}
                className={`
          ${verification.has_overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
          border-b border-gray-200
        `}
            >
                <TableCell className="font-medium border-r border-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        {verification.client_name}
                        {verification.has_overdue && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        )}
                    </div>
                </TableCell>

                {/* Poster Quota - Editable */}
                <TableCell className="border-r border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold">{verification.poster_quota}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={async () => {
                                const newQuota = parseInt(prompt(`New poster quota for ${verification.client_name}:`, verification.poster_quota.toString()) || '0');
                                if (newQuota !== verification.poster_quota && newQuota >= 0) {
                                    try {
                                        await axiosInstance.post(requests.updateQuota, {
                                            client_id: verification.client_id,
                                            content_type: 'posters',
                                            quota: newQuota
                                        });
                                        await fetchVerifications();
                                        toast.success('Poster quota updated');
                                    } catch (error) {
                                        toast.error('Failed to update quota');
                                    }
                                }
                            }}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                    </div>
                </TableCell>

                {/* Video Quota - Editable */}
                <TableCell className="border-r border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold">{verification.video_quota}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={async () => {
                                const newQuota = parseInt(prompt(`New video quota for ${verification.client_name}:`, verification.video_quota.toString()) || '0');
                                if (newQuota !== verification.video_quota && newQuota >= 0) {
                                    try {
                                        await axiosInstance.post(requests.updateQuota, {
                                            client_id: verification.client_id,
                                            content_type: 'videos',
                                            quota: newQuota
                                        });
                                        await fetchVerifications();
                                        toast.success('Video quota updated');
                                    } catch (error) {
                                        toast.error('Failed to update quota');
                                    }
                                }
                            }}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                    </div>
                </TableCell>

                {/* Posted Posters - Click to increment/decrement */}
                <TableCell
                    className="border-r border-gray-300 text-center"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${postersRemaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {verification.posted_posters}
                            </span>

                            <div className="flex flex-col">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-green-100"
                                    onClick={() => handleAddPostedContent(verification.client_id, 'poster')}
                                    disabled={postersRemaining === 0}
                                    title="Add poster"
                                >
                                    <ChevronUp className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={() => handleRemovePostedContent(verification.client_id, 'poster')}
                                    disabled={verification.posted_posters === 0}
                                    title="Remove poster"
                                >
                                    <ChevronDown className="h-3 w-3 text-red-600" />
                                </Button>
                            </div>
                        </div>

                        {postersRemaining > 0 && (
                            <span className="text-xs text-gray-500 mt-1">{postersRemaining} more needed</span>
                        )}
                    </div>
                </TableCell>

                {/* Posted Videos - Click to increment/decrement */}
                <TableCell
                    className="border-r border-gray-300 text-center"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${videosRemaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {verification.posted_videos}
                            </span>

                            <div className="flex flex-col">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-green-100"
                                    onClick={() => handleAddPostedContent(verification.client_id, 'video')}
                                    disabled={videosRemaining === 0}
                                    title="Add video"
                                >
                                    <ChevronUp className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={() => handleRemovePostedContent(verification.client_id, 'video')}
                                    disabled={verification.posted_videos === 0}
                                    title="Remove video"
                                >
                                    <ChevronDown className="h-3 w-3 text-red-600" />
                                </Button>
                            </div>
                        </div>

                        {videosRemaining > 0 && (
                            <span className="text-xs text-gray-500 mt-1">{videosRemaining} more needed</span>
                        )}
                    </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                    <div className="flex justify-center gap-2">
                        <Button
                            size="sm"
                            className={`${verification.is_verified ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium`}
                            onClick={() => handleVerifyClient(verification.client_id, verification.client_name)}
                            disabled={!verification.is_verified}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {verification.is_verified ? 'Verify' : 'Incomplete'}
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchClientDetails(verification.client_id)}
                            title="View details"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setSelectedForAdd({
                                    clientId: verification.client_id,
                                    contentType: 'poster'
                                });
                                setAddContentOpen(true);
                            }}
                            title="Add custom content"
                        >
                            +
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        );
    };

    const AddContentModal = () => {
        const [formData, setFormData] = useState({
            title: '',
            description: '',
            platform: '',
            content_url: '',
            contentType: selectedForAdd?.contentType || 'poster'
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleAddCustomContent(formData);
        };

        return (
            <Dialog open={addContentOpen} onOpenChange={setAddContentOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Posted Content</DialogTitle>
                        <DialogDescription>
                            Add detailed information for the posted content
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contentType" className="text-right">
                                    Content Type
                                </Label>
                                <Select
                                    value={formData.contentType}
                                    onValueChange={(value) => setFormData({ ...formData, contentType: value as 'poster' | 'video' })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="poster">Poster</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Enter content title"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Enter content description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="platform" className="text-right">
                                    Platform
                                </Label>
                                <Select
                                    value={formData.platform}
                                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="twitter">Twitter</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content_url" className="text-right">
                                    Content URL
                                </Label>
                                <Input
                                    id="content_url"
                                    type="url"
                                    value={formData.content_url}
                                    onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                                    className="col-span-3"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddContentOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Content
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    const ClientDetailsModal = () => {
        if (!selectedClient) return null;

        const groupedContent = selectedClient.posted_content.reduce((groups: Record<string, PostedContent[]>, item) => {
            const type = item.content_type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(item);
            return groups;
        }, {});

        return (
            <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Posted Content for {selectedClient.client_name}</span>
                            <Badge variant={selectedClient.statistics.is_verified ? "default" : "secondary"}>
                                {selectedClient.statistics.is_verified ? 'Verified' : 'Not Verified'}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDate.month}/{selectedDate.year} •
                            Posters: {selectedClient.statistics.posters_posted}/{selectedClient.statistics.posters_quota} •
                            Videos: {selectedClient.statistics.videos_posted}/{selectedClient.statistics.videos_quota}
                        </DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : selectedClient.total_count === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No posted content found for this month
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedContent).map(([type, items]) => (
                                <div key={type} className="space-y-3">
                                    <h3 className="text-lg font-semibold capitalize">{type}s ({items.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {items.map((item) => (
                                            <Card key={item.id} className="relative">
                                                <CardContent className="pt-6">
                                                    <div className="absolute top-3 right-3 flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => setContentToDelete(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="font-semibold">{item.title}</h4>
                                                            <Badge variant={
                                                                item.status === 'approved' ? 'default' :
                                                                    item.status === 'posted' ? 'secondary' :
                                                                        'outline'
                                                            }>
                                                                {item.status_display}
                                                            </Badge>
                                                        </div>

                                                        {item.description && (
                                                            <p className="text-sm text-gray-600">{item.description}</p>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                                            {item.platform_display && (
                                                                <span className="bg-gray-100 px-2 py-1 rounded">Platform: {item.platform_display}</span>
                                                            )}
                                                            <span>Posted: {new Date(item.posted_date).toLocaleDateString()}</span>
                                                            <span>Added by: {item.created_by_name}</span>
                                                        </div>

                                                        {item.content_url && (
                                                            <a
                                                                href={item.content_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                                            >
                                                                <ExternalLink className="h-3 w-3 mr-1" /> View Content
                                                            </a>
                                                        )}

                                                        {item.verified_by_name && (
                                                            <div className="text-xs text-green-600">
                                                                Verified by {item.verified_by_name} on {new Date(item.verified_date!).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                handleVerifyClient(selectedClient.client_id, selectedClient.client_name);
                                setSelectedClient(null);
                            }}
                            disabled={!selectedClient.statistics.is_verified}
                        >
                            Verify All Content
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const isCurrentMonth = selectedDate.month === new Date().getMonth() + 1 &&
        selectedDate.year === new Date().getFullYear();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Verification</h1>
                    <p className="text-muted-foreground mt-1">
                        {isCurrentMonth ? "Manage content verification and client deliverables" : `Verification records for ${new Date(selectedDate.year, selectedDate.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedDate.month.toString()}
                        onValueChange={(val) => setSelectedDate(prev => ({ ...prev, month: parseInt(val) }))}
                    >
                        <SelectTrigger className="w-32 bg-white">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedDate.year.toString()}
                        onValueChange={(val) => setSelectedDate(prev => ({ ...prev, year: parseInt(val) }))}
                    >
                        <SelectTrigger className="w-32 bg-white">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => (
                                <SelectItem key={i} value={(new Date().getFullYear() - 2 + i).toString()}>
                                    {new Date().getFullYear() - 2 + i}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={fetchVerifications}
                        variant="outline"
                        size="icon"
                        title="Refresh data"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Verified Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.verifiedClients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Incomplete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.incompleteClients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Posters Posted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalPostedPosters}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Videos Posted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.totalPostedVideos}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Verification Dashboard</CardTitle>
                    <CardDescription>
                        Click on arrow buttons to add/remove posted content. Click Verify when quotas are met.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableHeaderRow />
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : currentMonthVerifications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No clients found for selected month
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentMonthVerifications.map((verification, index) => (
                                        <DataTableRow key={verification.client_id} index={index} verification={verification} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <AddContentModal />
            <ClientDetailsModal />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!contentToDelete} onOpenChange={(open) => !open && setContentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the {contentToDelete?.content_type_display?.toLowerCase()}
                            titled "{contentToDelete?.title}" posted on {contentToDelete ? new Date(contentToDelete.posted_date).toLocaleDateString() : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteContent} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Verification;