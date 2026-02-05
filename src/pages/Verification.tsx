import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Clock, Loader2, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface Verification {
    client_id: number;
    client_name: string;
    total_posters: number;
    total_videos: number;
    total_reels: number;
    total_stories: number;
    posted_posters: number;
    posted_videos: number;
    posted_reels: number;
    posted_stories: number;
    pending_videos: number;
    pending_posters: number;
    pending_reels: number;
    pending_stories: number;
    content_details: string;
    is_verified: boolean;
    payment_date: string;
    payment_status: string;
    has_overdue: boolean;
    completion_date?: string;
    status?: string;
}

const Verification = () => {
    const [currentMonthVerifications, setCurrentMonthVerifications] = useState<Verification[]>([]);
    const [previousMonthsVerifications, setPreviousMonthsVerifications] = useState<Verification[]>([]);
    const [verifiedClients, setVerifiedClients] = useState<Verification[]>([]);
    const [showVerifiedClients, setShowVerifiedClients] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        currentMonth: 0,
        previousMonths: 0,
        total: 0,
    });

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{ clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos' } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        fetchVerifications();
    }, [selectedDate]);



    const fetchVerifications = async () => {
        try {
            setLoading(true);
            // Use the Dashboard API to get ALL clients with their status
            const response = await axiosInstance.get(requests.VerificationDashboard, {
                params: {
                    month: selectedDate.month,
                    year: selectedDate.year
                }
            });
            const dashboardData = response.data; // Expecting array from API 5

            // Map API 5 response to UI model
            const mapToVerification = (item: any): Verification => ({
                client_id: item.client_id,
                client_name: item.client_name,
                total_posters: item.poster_quota || 0,
                total_videos: item.video_quota || 0,
                total_reels: item.reel_quota || 0,
                total_stories: item.story_quota || 0,
                posted_posters: item.posted_posters || 0,
                posted_videos: item.posted_videos || 0,
                posted_reels: item.posted_reels || 0,
                posted_stories: item.posted_stories || 0,
                pending_videos: item.pending_videos || 0,
                pending_posters: item.pending_posters || 0,
                pending_reels: item.pending_reels || 0,
                pending_stories: item.pending_stories || 0,
                content_details: item.industry || "",
                payment_date: item.payment_date || "-",
                payment_status: item.payment_status || "pending",
                has_overdue: item.has_overdue || false,
                is_verified: item.is_verified || false,
                status: 'Active'
            });

            const mappedData = Array.isArray(dashboardData) ? dashboardData.map(mapToVerification) : [];
            // Cache mapped data for handler lookup
            (window as any)._allMappedData = mappedData;

            // Master List: Show everyone for the selected month to provide a full overview
            setCurrentMonthVerifications(mappedData);

            // Action List: Only clients who have items waiting for verification (pending > 0)
            const pendingActionList = mappedData.filter(v =>
                !v.is_verified && (v.pending_videos > 0 || v.pending_posters > 0 || v.pending_reels > 0 || v.pending_stories > 0)
            );
            setPreviousMonthsVerifications(pendingActionList);

            // Archive List: Only those who are fully verified
            const verifiedList = mappedData.filter(v => v.is_verified);
            setVerifiedClients(verifiedList);

            setStats({
                currentMonth: mappedData.length,
                previousMonths: mappedData.filter(c => c.has_overdue).length,
                total: mappedData.length,
            });

        } catch (error) {
            console.error('Error fetching verifications:', error);
            toast.error('Failed to load verification dashboard');
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyClick = async (client_id: number, client_name: string) => {
        // Find the client in any of the lists
        const client = currentMonthVerifications.find(v => v.client_id === client_id);
        if (!client) return;

        // Check if all quotas are met locally first to give instant feedback
        const quotasMet =
            client.posted_posters >= client.total_posters &&
            client.posted_videos >= client.total_videos;

        if (!quotasMet) {
            toast.error(`Please complete all content quotas before verifying ${client_name}`);
            return;
        }

        // Check payment status
        const isPaid = ['paid', 'early_paid'].includes(client.payment_status.toLowerCase());
        if (!isPaid) {
            toast.error(`Verification blocked: ${client_name} payment status is "${client.payment_status}". Please mark as paid first.`);
            return;
        }

        try {
            // Call API to persist verification
            await axiosInstance.post(requests.MarkClientVerified, {
                client_id,
                month: selectedDate.month,
                year: selectedDate.year
            });

            // Refresh data from server to ensure state is consistent
            await fetchVerifications();

            // Show the verified list so the user sees the client moved there
            setShowVerifiedClients(true);

            toast.success(`${client_name} verified successfully!`);
        } catch (error) {
            console.error('Error verifying client:', error);
            toast.error(`Failed to verify ${client_name}`);
        }
    };

    // Inline editing handlers
    const handleCellClick = (clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos', currentValue: number) => {
        setEditingCell({ clientId, field });
        setEditValue(currentValue.toString());
    };

    const handleEditSave = async (clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos') => {
        const newValue = parseInt(editValue);
        if (isNaN(newValue) || newValue < 0) {
            toast.error('Please enter a valid number');
            setEditingCell(null);
            return;
        }

        try {
            if (field.startsWith('quota_')) {
                const contentType = field.replace('quota_', '');
                await axiosInstance.post(requests.UpdateClientQuota, {
                    client_id: clientId,
                    content_type: contentType,
                    quota: newValue
                });
            } else {
                await axiosInstance.post(requests.UpdatePostedCount, {
                    client_id: clientId,
                    content_type: field,
                    count: newValue
                });
            }

            // Refresh data from server to ensure state is perfectly synced
            await fetchVerifications();

            setEditingCell(null);
            toast.success('Updated successfully');
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('Failed to update');
            setEditingCell(null);
        }
    };

    const handleEditCancel = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent, clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos') => {
        if (e.key === 'Enter') {
            handleEditSave(clientId, field);
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    const TableHeaderRow = ({ showActions = true }: { showActions?: boolean }) => (
        <TableRow className="bg-gray-100">
            <TableHead className="text-black font-semibold border-r border-gray-300">Client Name</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300">Poster(Total)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300">Video(Total)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300">Poster (pst)</TableHead>
            <TableHead className="text-black font-semibold border-r border-gray-300">Video(pst)</TableHead>
            {showActions && <TableHead className="text-black font-semibold text-center">Actions</TableHead>}
        </TableRow>
    );

    // Helper function to determine cell color based on completion status
    const getCompletionColor = (posted: number, quota: number): string => {
        if (quota === 0) return ''; // No quota set
        if (posted >= quota) return 'bg-green-200 text-green-900 font-semibold'; // Complete
        if (posted > 0) return 'bg-yellow-100 text-yellow-900'; // In progress
        return 'bg-orange-50'; // Not started
    };

    const DataTableRow = ({ verification, isOverdue = false, showActions = true }: { verification: Verification, isOverdue?: boolean, showActions?: boolean }) => (
        <TableRow
            key={verification.client_id}
            className={`
                ${isOverdue ? 'bg-red-100 hover:bg-red-200 text-red-900' : 'bg-blue-50 hover:bg-blue-100 text-blue-900'}
                border-b border-gray-200
            `}
        >
            <TableCell className="font-medium border-r border-gray-300 whitespace-nowrap">{verification.client_name}</TableCell>
            <TableCell className="border-r border-gray-300 text-center cursor-pointer hover:ring-2 hover:ring-blue-400"
                onClick={() => handleCellClick(verification.client_id, 'quota_posters', verification.total_posters)}
            >
                {editingCell?.clientId === verification.client_id && editingCell?.field === 'quota_posters' ? (
                    <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSave(verification.client_id, 'quota_posters')}
                        onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'quota_posters')}
                        className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                        min="0"
                    />
                ) : (
                    verification.total_posters
                )}
            </TableCell>
            <TableCell className="border-r border-gray-300 text-center cursor-pointer hover:ring-2 hover:ring-blue-400"
                onClick={() => handleCellClick(verification.client_id, 'quota_videos', verification.total_videos)}
            >
                {editingCell?.clientId === verification.client_id && editingCell?.field === 'quota_videos' ? (
                    <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSave(verification.client_id, 'quota_videos')}
                        onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'quota_videos')}
                        className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                        min="0"
                    />
                ) : (
                    verification.total_videos
                )}
            </TableCell>
            <TableCell className={`border-r border-gray-300 text-center ${getCompletionColor(verification.posted_posters, verification.total_posters)} cursor-pointer hover:ring-2 hover:ring-blue-400`}
                onClick={() => handleCellClick(verification.client_id, 'posters', verification.posted_posters)}
            >
                {editingCell?.clientId === verification.client_id && editingCell?.field === 'posters' ? (
                    <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSave(verification.client_id, 'posters')}
                        onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'posters')}
                        className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                        min="0"
                    />
                ) : (
                    verification.posted_posters
                )}
            </TableCell>
            <TableCell className={`border-r border-gray-300 text-center ${getCompletionColor(verification.posted_videos, verification.total_videos)} cursor-pointer hover:ring-2 hover:ring-blue-400`}
                onClick={() => handleCellClick(verification.client_id, 'videos', verification.posted_videos)}
            >
                {editingCell?.clientId === verification.client_id && editingCell?.field === 'videos' ? (
                    <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSave(verification.client_id, 'videos')}
                        onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'videos')}
                        className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                        min="0"
                    />
                ) : (
                    verification.posted_videos
                )}
            </TableCell>
            {showActions && (
                <TableCell>
                    <div className="flex justify-center">
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium"
                            onClick={() => handleVerifyClick(verification.client_id, verification.client_name)}
                        >
                            Submit
                        </Button>
                    </div>
                </TableCell>
            )}
        </TableRow>
    );

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
                        onClick={() => setShowVerifiedClients(!showVerifiedClients)}
                        variant={showVerifiedClients ? "default" : "outline"}
                        className={showVerifiedClients ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {showVerifiedClients ? 'Hide' : 'View'} Verified Clients ({verifiedClients.length})
                    </Button>
                    <Button onClick={fetchVerifications} variant="outline" size="icon" title="Refresh">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Current Month Clients</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.currentMonth}</div>
                        <p className="text-xs text-blue-700">Active listings</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Overdue / Critical</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">{stats.previousMonths}</div>
                        <p className="text-xs text-red-700">Items requiring attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Clients</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.total}</div>
                        <p className="text-xs text-green-700">Total tracked</p>
                    </CardContent>
                </Card>
            </div>

            {/* Master List - Current Month Client Verification List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        Current Month Client Verification List
                    </CardTitle>
                    <CardDescription>Full overview of all active client quotas and progress</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableHeaderRow showActions={true} />
                                </TableHeader>
                                <TableBody>
                                    {currentMonthVerifications.map((verification, index) => (
                                        <DataTableRow key={index} verification={verification} isOverdue={verification.has_overdue} showActions={true} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action List - Pending Verification List */}
            {previousMonthsVerifications.length > 0 && (
                <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50/50">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-cyan-600" />
                            Pending Verification List
                        </CardTitle>
                        <CardDescription>Clients with unverified work waiting for your sign-off</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableHeaderRow />
                                </TableHeader>
                                <TableBody>
                                    {previousMonthsVerifications.map((verification, index) => (
                                        <DataTableRow key={index} verification={verification} isOverdue={verification.has_overdue} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* Verified Clients Section */}
            {
                showVerifiedClients && (
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                Verified Clients
                            </CardTitle>
                            <CardDescription>
                                Clients who have met their monthly quotas and been verified
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {verifiedClients.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No verified clients yet</p>
                                    <p className="text-sm">Clients will appear here once their quotas are met and verified</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableHeaderRow showActions={false} />
                                        </TableHeader>
                                        <TableBody>
                                            {verifiedClients.map((verification, index) => (
                                                <DataTableRow key={index} verification={verification} showActions={false} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }


        </div >
    );
};

export default Verification;
