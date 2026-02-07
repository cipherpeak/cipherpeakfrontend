import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Clock, Loader2, CheckCircle, Calendar as CalendarIcon, Edit, Trash2, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

interface Verification {
    client_id: number;
    client_name: string;
    total_posters: number;
    total_videos: number;
    posted_posters: number;
    posted_videos: number;
    pending_videos: number;
    pending_posters: number;
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
            const response = await axiosInstance.get(requests.VerificationDashboard, {
                params: {
                    month: selectedDate.month,
                    year: selectedDate.year
                }
            });
            const dashboardData = response.data;

            const mapToVerification = (item: any): Verification => ({
                client_id: item.client_id,
                client_name: item.client_name,
                total_posters: item.poster_quota || 0,
                total_videos: item.video_quota || 0,
                posted_posters: item.posted_posters || 0,
                posted_videos: item.posted_videos || 0,
                pending_videos: item.pending_videos || 0,
                pending_posters: item.pending_posters || 0,
                content_details: item.industry || "",
                payment_date: item.payment_date || "-",
                payment_status: item.payment_status || "pending",
                has_overdue: item.has_overdue || false,
                is_verified: item.is_verified || false,
                status: 'Active'
            });

            const mappedData = Array.isArray(dashboardData) ? dashboardData.map(mapToVerification) : [];

            setCurrentMonthVerifications(mappedData.filter(v => !v.is_verified));

            const pendingActionList = mappedData.filter(v =>
                !v.is_verified && (v.pending_videos > 0 || v.pending_posters > 0)
            );
            setPreviousMonthsVerifications(pendingActionList);

            setVerifiedClients(mappedData.filter(v => v.is_verified));

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
        // Find the client in the master list
        const client = currentMonthVerifications.find(v => v.client_id === client_id);
        if (!client) return;

        // Check if all quotas are met locally first to give instant feedback
        const actualPosters = client.posted_posters + client.pending_posters;
        const actualVideos = client.posted_videos + client.pending_videos;
        const quotasMet = actualPosters >= client.total_posters && actualVideos >= client.total_videos;

        if (!quotasMet) {
            toast.error(`Please complete all content quotas before verifying ${client_name}`);
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

            toast.success(`${client_name} verified successfully!`);
        } catch (error) {
            console.error('Error verifying client:', error);
            toast.error(`Failed to verify ${client_name}`);
        }
    };

    const handleCellClick = (clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos', currentValue: number) => {
        setEditingCell({ clientId, field });
        setEditValue(currentValue.toString());
    };

    const handleEditSave = async (clientId: number, field: 'posters' | 'videos' | 'quota_posters' | 'quota_videos') => {
        const newValue = parseInt(editValue);
        if (isNaN(newValue) || newValue < 0) {
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
                    count: newValue,
                    month: selectedDate.month,
                    year: selectedDate.year
                });
            }

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

    const handleKeyDown = (e: React.KeyboardEvent, clientId: number, field: string, index: number) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            handleEditSave(clientId, field as any);

            // Focus next cell
            const fields = ['quota_posters', 'quota_videos', 'posters', 'videos'];
            const currentFieldIndex = fields.indexOf(field);
            let nextId = "";

            if (currentFieldIndex < fields.length - 1) {
                // Same row, next field
                const nextField = fields[currentFieldIndex + 1];
                nextId = `cell-${clientId}-${nextField}`;
            } else if (index < currentMonthVerifications.length - 1) {
                // Next row, first field
                const nextClient = currentMonthVerifications[index + 1];
                nextId = `cell-${nextClient.client_id}-quota_posters`;
            }

            if (nextId) {
                setTimeout(() => {
                    const nextCell = document.getElementById(nextId);
                    if (nextCell) nextCell.click();
                }, 100);
            }
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

    const DataTableRow = ({ verification, index, isOverdue = false, showActions = true }: { verification: Verification, index: number, isOverdue?: boolean, showActions?: boolean }) => {
        const actualPosters = verification.posted_posters + verification.pending_posters;
        const actualVideos = verification.posted_videos + verification.pending_videos;
        const remainingPosters = Math.max(0, verification.total_posters - actualPosters);
        const remainingVideos = Math.max(0, verification.total_videos - actualVideos);

        return (
            <TableRow
                key={verification.client_id}
                className={`
                ${isOverdue ? 'bg-red-100 hover:bg-red-200 text-red-900' : 'bg-blue-50 hover:bg-blue-100 text-blue-900'}
                border-b border-gray-200
            `}
            >
                <TableCell className="font-medium border-r border-gray-300 whitespace-nowrap">{verification.client_name}</TableCell>
                <TableCell
                    id={`cell-${verification.client_id}-quota_posters`}
                    className="border-r border-gray-300 text-center cursor-pointer hover:ring-2 hover:ring-blue-400"
                    onClick={() => handleCellClick(verification.client_id, 'quota_posters', verification.total_posters)}
                >
                    {editingCell?.clientId === verification.client_id && editingCell?.field === 'quota_posters' ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(verification.client_id, 'quota_posters')}
                            onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'quota_posters', index)}
                            className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            autoFocus
                            min="0"
                        />
                    ) : (
                        remainingPosters
                    )}
                </TableCell>
                <TableCell
                    id={`cell-${verification.client_id}-quota_videos`}
                    className="border-r border-gray-300 text-center cursor-pointer hover:ring-2 hover:ring-blue-400"
                    onClick={() => handleCellClick(verification.client_id, 'quota_videos', verification.total_videos)}
                >
                    {editingCell?.clientId === verification.client_id && editingCell?.field === 'quota_videos' ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(verification.client_id, 'quota_videos')}
                            onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'quota_videos', index)}
                            className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            autoFocus
                            min="0"
                        />
                    ) : (
                        remainingVideos
                    )}
                </TableCell>
                <TableCell
                    id={`cell-${verification.client_id}-posters`}
                    className={`border-r border-gray-300 text-center ${remainingPosters === 0 ? 'bg-green-200 text-green-900 font-semibold' : 'bg-orange-50'} cursor-pointer hover:ring-2 hover:ring-blue-400`}
                    onClick={() => handleCellClick(verification.client_id, 'posters', actualPosters)}
                >
                    {editingCell?.clientId === verification.client_id && editingCell?.field === 'posters' ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(verification.client_id, 'posters')}
                            onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'posters', index)}
                            className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            autoFocus
                            min="0"
                        />
                    ) : (
                        actualPosters
                    )}
                </TableCell>
                <TableCell
                    id={`cell-${verification.client_id}-videos`}
                    className={`border-r border-gray-300 text-center ${remainingVideos === 0 ? 'bg-green-200 text-green-900 font-semibold' : 'bg-orange-50'} cursor-pointer hover:ring-2 hover:ring-blue-400`}
                    onClick={() => handleCellClick(verification.client_id, 'videos', actualVideos)}
                >
                    {editingCell?.clientId === verification.client_id && editingCell?.field === 'videos' ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(verification.client_id, 'videos')}
                            onKeyDown={(e) => handleKeyDown(e, verification.client_id, 'videos', index)}
                            className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            autoFocus
                            min="0"
                        />
                    ) : (
                        actualVideos
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Clients in List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isCurrentMonth ? currentMonthVerifications.length : 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Verified Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{verifiedClients.length}</div>
                    </CardContent>
                </Card>
            </div>

            {isCurrentMonth && (
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableHeaderRow />
                                </TableHeader>
                                <TableBody>
                                    {currentMonthVerifications.map((verification, index) => (
                                        <DataTableRow key={index} index={index} verification={verification} isOverdue={verification.has_overdue} showActions={true} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Verified Clients Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Verified Clients</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableHeaderRow showActions={false} />
                        </TableHeader>
                        <TableBody>
                            {verifiedClients.map((verification, index) => (
                                <DataTableRow key={index} index={index} verification={verification} showActions={false} />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Verification;
