import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Video, Image, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';

interface ContentItem {
    id: number;
    content_type: string;
    completion_date: string;
    verified_by: number | null;
    verified_by_name?: string;
    notes?: string;
}

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
    clientName: string;
    onVerificationComplete: () => void;
}

const VerificationModal = ({ isOpen, onClose, clientId, clientName, onVerificationComplete }: VerificationModalProps) => {
    const [loading, setLoading] = useState(false);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [pendingVideos, setPendingVideos] = useState<ContentItem[]>([]);
    const [pendingPosters, setPendingPosters] = useState<ContentItem[]>([]);
    const [pendingReels, setPendingReels] = useState<ContentItem[]>([]);
    const [pendingStories, setPendingStories] = useState<ContentItem[]>([]);

    useEffect(() => {
        if (isOpen && clientId) {
            fetchPendingItems();
        }
    }, [isOpen, clientId]);

    const fetchPendingItems = async () => {
        if (!clientId) return;

        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.VerificationClientDetails(clientId));
            console.log("VerificationModal API Response:", response.data); // DEBUG LOG
            const { videos = [], posters = [], reels = [], stories = [] } = response.data;

            // Filter only pending items
            setPendingVideos(videos.filter((item: ContentItem) => !item.verified_by));
            setPendingPosters(posters.filter((item: ContentItem) => !item.verified_by));
            setPendingReels(reels.filter((item: ContentItem) => !item.verified_by));
            setPendingStories(stories.filter((item: ContentItem) => !item.verified_by));
        } catch (error) {
            console.error('Error fetching pending items:', error);
            // toast.error('Failed to load pending items'); // Optional: suppress if just checking
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyParams = async (itemId: number) => {
        try {
            setVerifyingId(itemId);
            await axiosInstance.post(requests.MarkVerificationVerified, {
                verification_id: itemId
            });

            toast.success('Item verified successfully');

            // Remove from local list
            // Remove from local list
            setPendingVideos(prev => prev.filter(item => item.id !== itemId));
            setPendingPosters(prev => prev.filter(item => item.id !== itemId));
            setPendingReels(prev => prev.filter(item => item.id !== itemId));
            setPendingStories(prev => prev.filter(item => item.id !== itemId));

            // Trigger parent refresh
            onVerificationComplete();

        } catch (error: any) {
            console.error('Error verifying item:', error);
            toast.error(error.response?.data?.message || 'Failed to verify item');
        } finally {
            setVerifyingId(null);
        }
    };

    const EmptyState = ({ type }: { type: string }) => (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mb-2 opacity-20" />
            <p>No pending {type} to verify</p>
        </div>
    );

    const ItemList = ({ items }: { items: ContentItem[] }) => (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">#{item.id}</Badge>
                            <span className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(item.completion_date).toLocaleDateString()}
                            </span>
                        </div>
                        {item.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {item.notes}
                            </p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerifyParams(item.id)}
                        disabled={verifyingId === item.id}
                    >
                        {verifyingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                            </>
                        )}
                    </Button>
                </div>
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Verify Content - {clientName}</DialogTitle>
                    <DialogDescription>
                        Review and verify pending content items for this client.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Tabs defaultValue="videos" className="w-full flex-1 overflow-hidden flex flex-col">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="videos">
                                <Video className="h-4 w-4 mr-2" />
                                Videos ({pendingVideos.length})
                            </TabsTrigger>
                            <TabsTrigger value="posters">
                                <Image className="h-4 w-4 mr-2" />
                                Posters ({pendingPosters.length})
                            </TabsTrigger>
                            <TabsTrigger value="reels">
                                <Video className="h-4 w-4 mr-2" />
                                Reels ({pendingReels.length})
                            </TabsTrigger>
                            <TabsTrigger value="stories">
                                <Image className="h-4 w-4 mr-2" />
                                Stories ({pendingStories.length})
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="flex-1 mt-4 pr-4">
                            <TabsContent value="videos" className="m-0">
                                {pendingVideos.length > 0 ? (
                                    <ItemList items={pendingVideos} />
                                ) : (
                                    <EmptyState type="videos" />
                                )}
                            </TabsContent>
                            <TabsContent value="posters" className="m-0">
                                {pendingPosters.length > 0 ? (
                                    <ItemList items={pendingPosters} />
                                ) : (
                                    <EmptyState type="posters" />
                                )}
                            </TabsContent>
                            <TabsContent value="reels" className="m-0">
                                {pendingReels.length > 0 ? (
                                    <ItemList items={pendingReels} />
                                ) : (
                                    <EmptyState type="reels" />
                                )}
                            </TabsContent>
                            <TabsContent value="stories" className="m-0">
                                {pendingStories.length > 0 ? (
                                    <ItemList items={pendingStories} />
                                ) : (
                                    <EmptyState type="stories" />
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VerificationModal;
