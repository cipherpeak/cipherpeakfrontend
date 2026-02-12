
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Layout,
    Video,
    Save,
    Archive,
    FileText,
    BadgeCheck,
    Loader2,
    History,
    CalendarDays
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClientVerification {
    id: number;
    client_name: string;
    client_monthly_poster: string | number;
    client_monthly_videos: string | number;
    posters_completed: number;
    videos_completed: number;
    posters_posted: number;
    videos_posted: number;
    is_completed: boolean;
    is_verified: boolean;
}

const MonthlyClientVerification = () => {
    const [clients, setClients] = useState<ClientVerification[]>([]);
    const [verifiedClients, setVerifiedClients] = useState<ClientVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [savingIds, setSavingIds] = useState<number[]>([]);
    const [closingIds, setClosingIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState<string>("active");

    const fetchVerifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(requests.fetchMonthelyClientVerification);
            // Handling both array and object responses (with 'results' or similar)
            const data = response.data;

            if (Array.isArray(data)) {
                setClients(data);
            } else if (data && typeof data === 'object') {
                setClients(data.results || data.data || []);
            }
        } catch (err: any) {
            console.error('Error fetching verifications:', err);
            setError('Failed to load verification data. Please try again later.');
            toast.error('Failed to load verification data');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerifiedVerifications = async () => {
        setHistoryLoading(true);
        try {
            const response = await axiosInstance.get(requests.fetchVerifiedClients, {
                params: {
                    month: selectedMonth,
                    year: selectedYear
                }
            });
            const data = response.data;
            if (Array.isArray(data)) {
                setVerifiedClients(data);
            } else if (data && typeof data === 'object') {
                setVerifiedClients(data.results || data.data || []);
            }
        } catch (err: any) {
            console.error('Error fetching verified verifications:', err);
            toast.error('Failed to load verified history');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "active") {
            fetchVerifications();
        } else {
            fetchVerifiedVerifications();
        }
    }, [activeTab, selectedMonth, selectedYear]);


    console.log(clients, "this are  verification")
    const handleInputChange = (id: number, field: keyof ClientVerification, value: string) => {
        setClients(prev => prev.map(client =>
            client.id === id ? { ...client, [field]: parseInt(value) || 0 } : client
        ));
    };

    const handleSave = async (client: ClientVerification) => {
        setSavingIds(prev => [...prev, client.id]);
        try {
            await axiosInstance.post(requests.fetchMonthelyClientVerification, {
                id: client.id,
                posters_completed: client.posters_completed,
                videos_completed: client.videos_completed,
                posters_posted: client.posters_posted,
                videos_posted: client.videos_posted
            });
            toast.success(`Progress saved for ${client.client_name}`);
            // Optional: Re-fetch to get updated is_completed status or other server-side calcs
            // fetchVerifications(); 
        } catch (err: any) {
            console.error('Error saving verification:', err);
            toast.error(`Failed to save progress for ${client.client_name}`);
        } finally {
            setSavingIds(prev => prev.filter(id => id !== client.id));
        }
    };

    const handleCloseMonth = async (client: ClientVerification) => {
        setClosingIds(prev => [...prev, client.id]);
        try {
            await axiosInstance.post(requests.closeMonthlyVerification, {
                id: client.id
            });
            toast.success(`${client.client_name} - Month closed successfully`);
            fetchVerifications(); // Refresh list as verified clients are excluded
        } catch (err: any) {
            console.error('Error closing month:', err);
            toast.error(`Failed to close month for ${client.client_name}`);
        } finally {
            setClosingIds(prev => prev.filter(id => id !== client.id));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/30">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Fetching verification data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/30 p-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl ring-1 ring-slate-200 text-center max-w-md">
                    <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Layout className="h-8 w-8 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Oops!</h2>
                    <p className="text-slate-500 mb-8 font-medium">{error}</p>
                    <Button
                        onClick={fetchVerifications}
                        className="w-full rounded-2xl font-black py-6 bg-slate-900 hover:bg-slate-800"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const renderClientCard = (client: ClientVerification, isHistory: boolean = false) => {
        const isVerified = client.is_verified;

        return (
            <Card key={client.id} className="group overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(30,41,59,0.12)] transition-all duration-500 rounded-[2.5rem] bg-white ring-1 ring-slate-200/50">
                <CardHeader className="pb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    <div className="flex justify-between items-start z-10">
                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-500">
                            <Layout className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                        </div>
                        {isVerified && (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 shadow-none animate-in zoom-in-50">
                                VERIFIED
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800 mt-4 tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                        {client.client_name}
                    </CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">
                        {isHistory ? 'Historical Record' : 'Verified Client Record'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-blue-50 rounded-lg">
                                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-700 uppercase italic">Posters</span>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-bold text-slate-400 pl-1 uppercase tracking-tighter mb-1">Target: <span className="text-slate-600">{client.client_monthly_poster}</span></p>
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Finished</Label>
                                <Input
                                    type="number"
                                    value={client.posters_completed}
                                    readOnly={isHistory}
                                    onChange={(e) => handleInputChange(client.id, 'posters_completed', e.target.value)}
                                    className={`bg-slate-50/50 border-slate-100 font-black text-blue-700 focus:ring-blue-500/20 rounded-xl h-9 ${isHistory ? 'opacity-70' : ''}`}
                                />
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Posted</Label>
                                <Input
                                    type="number"
                                    value={client.posters_posted}
                                    readOnly={isHistory}
                                    onChange={(e) => handleInputChange(client.id, 'posters_posted', e.target.value)}
                                    className={`bg-slate-50/50 border-slate-100 font-black text-blue-800 focus:ring-blue-500/20 rounded-xl h-9 ${isHistory ? 'opacity-70' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-rose-50 rounded-lg">
                                    <Video className="h-3.5 w-3.5 text-rose-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-700 uppercase italic">Videos</span>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-bold text-slate-400 pl-1 uppercase tracking-tighter mb-1">Target: <span className="text-slate-600">{client.client_monthly_videos}</span></p>
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Finished</Label>
                                <Input
                                    type="number"
                                    value={client.videos_completed}
                                    readOnly={isHistory}
                                    onChange={(e) => handleInputChange(client.id, 'videos_completed', e.target.value)}
                                    className={`bg-slate-50/50 border-slate-100 font-black text-rose-700 focus:ring-rose-500/20 rounded-xl h-9 ${isHistory ? 'opacity-70' : ''}`}
                                />
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Posted</Label>
                                <Input
                                    type="number"
                                    value={client.videos_posted}
                                    readOnly={isHistory}
                                    onChange={(e) => handleInputChange(client.id, 'videos_posted', e.target.value)}
                                    className={`bg-slate-50/50 border-slate-100 font-black text-rose-900 focus:ring-rose-500/20 rounded-xl h-9 ${isHistory ? 'opacity-70' : ''}`}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>

                {!isHistory && (
                    <CardFooter className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 bg-slate-50/30">
                        <Button
                            onClick={() => handleSave(client)}
                            disabled={savingIds.includes(client.id)}
                            variant="outline"
                            className="rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-white hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                        >
                            {savingIds.includes(client.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                            {savingIds.includes(client.id) ? 'Saving...' : 'Submit'}
                        </Button>
                        <Button
                            onClick={() => handleCloseMonth(client)}
                            disabled={closingIds.includes(client.id) || savingIds.includes(client.id)}
                            className="rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-md group/btn"
                        >
                            {closingIds.includes(client.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Archive className="h-3 w-3 group-hover/btn:rotate-12 transition-transform" />
                            )}
                            {closingIds.includes(client.id) ? 'Closing...' : 'Close'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        );
    };

    if (loading && activeTab === "active") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/30">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Fetching verification data...</p>
            </div>
        );
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic flex items-center gap-3">
                        <BadgeCheck className="h-10 w-10 text-primary" />
                        Client <span className="text-primary">Verification</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide">
                        Manage and track content deliverables for clients.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {activeTab === "verified" && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-slate-200/50">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[140px] border-none shadow-none font-bold text-slate-600 focus:ring-0">
                                    <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                    {months.map((month, idx) => (
                                        <SelectItem key={month} value={(idx + 1).toString()} className="font-bold text-slate-600 focus:bg-slate-50 rounded-xl">
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[100px] border-none shadow-none font-bold text-slate-600 focus:ring-0">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                    {years.map(year => (
                                        <SelectItem key={year} value={year} className="font-bold text-slate-600 focus:bg-slate-50 rounded-xl">
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-slate-200/50">
                        <Badge variant="outline" className="text-xs font-black px-4 py-1.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary">
                            {months[parseInt(selectedMonth) - 1]?.toUpperCase()} {selectedYear}
                        </Badge>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-white p-1.5 rounded-[2rem] h-auto shadow-sm ring-1 ring-slate-200/50">
                        <TabsTrigger
                            value="active"
                            className="rounded-full px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2"
                        >
                            <Layout className="h-3.5 w-3.5" />
                            Pending
                        </TabsTrigger>
                        <TabsTrigger
                            value="verified"
                            className="rounded-full px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2"
                        >
                            <History className="h-3.5 w-3.5" />
                            Verified History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="mt-0 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {clients.map(client => renderClientCard(client, false))}
                    </div>
                    {clients.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] shadow-sm ring-1 ring-slate-200">
                            <Archive className="h-16 w-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No pending verifications found</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="verified" className="mt-0 space-y-8">
                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {verifiedClients.map(client => renderClientCard(client, true))}
                            </div>
                            {verifiedClients.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] shadow-sm ring-1 ring-slate-200">
                                    <History className="h-16 w-16 text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">No verified records for this period</p>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MonthlyClientVerification;
