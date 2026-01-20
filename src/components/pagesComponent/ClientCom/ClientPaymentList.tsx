
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    IndianRupee,
    Calendar,
    Loader2,
    Eye,
    Plus,
} from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';
import ProcessClientPaymentModal, { PaymentData } from '@/components/modals/ProcessClientPaymentModal';
import PaymentDetailModal from '@/components/modals/PaymentDetailModal';
import { cn } from '@/lib/utils';

export interface ClientPayment {
    id: number;
    month: number;
    year: number;
    amount: string;
    net_amount: string;
    payment_date: string;
    scheduled_date: string;
    status: string;
    status_display: string;
    payment_method: string;
    transaction_id: string;
}

interface ClientPaymentListProps {
    clientId: number;
    clientName: string;
    monthlyRetainer?: string;
    onUpdate?: () => void;
}

const ClientPaymentList = ({ clientId, clientName, monthlyRetainer, onUpdate }: ClientPaymentListProps) => {
    const [payments, setPayments] = useState<ClientPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchPayments = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(requests.ClientPaymentList(clientId));
            // The API returns { client_name, total_payments, payments: [...] }
            setPayments(response.data.payments || []);
        } catch (err) {
            console.error('Error fetching client payments:', err);
            // toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [clientId]);

    const handleProcessPayment = async (data: PaymentData) => {
        setProcessing(true);
        try {
            await axiosInstance.post(requests.ProcessClientPayment(clientId), data);
            toast.success('Payment processed successfully');
            setIsProcessModalOpen(false);
            fetchPayments();
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error('Error processing payment:', err);
            toast.error(err.response?.data?.error || 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleViewDetail = (id: number) => {
        setSelectedPaymentId(id);
        setIsDetailModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'early_paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'partial':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'short' });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        Usage & Payment History
                    </CardTitle>
                    <Button onClick={() => setIsProcessModalOpen(true)} size="sm" className="h-8">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Process Payment
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : payments && payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-2 px-5 text-xs font-semibold">Period</TableHead>
                                        <TableHead className="py-2 px-4 text-xs font-semibold">Payment Date</TableHead>
                                        <TableHead className="py-2 px-4 text-xs font-semibold">Amount</TableHead>
                                        <TableHead className="py-2 px-4 text-xs font-semibold">Method</TableHead>
                                        <TableHead className="py-2 px-4 text-xs font-semibold">Status</TableHead>
                                        <TableHead className="py-2 px-5 text-xs font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium py-2.5 px-5 text-sm">
                                                {getMonthName(payment.month)} {payment.year}
                                            </TableCell>
                                            <TableCell className="py-2.5 px-4 text-sm">
                                                {formatDate(payment.payment_date)}
                                            </TableCell>
                                            <TableCell className="py-2.5 px-4 text-sm font-semibold">₹{payment.net_amount}</TableCell>
                                            <TableCell className="capitalize py-2.5 px-4 text-sm">
                                                {(payment.payment_method || '-').replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className="py-2.5 px-4">
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", getStatusColor(payment.status))}>
                                                    {payment.status_display}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-2.5 px-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleViewDetail(payment.id)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No payment history found</p>
                            <p className="text-sm">Process a client payment to see it here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ProcessClientPaymentModal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                onConfirm={handleProcessPayment}
                clientName={clientName}
                monthlyRetainer={monthlyRetainer}
                isLoading={processing}
            />

            <PaymentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPaymentId(null);
                }}
                title="Payment Details"
                paymentId={selectedPaymentId}
                type="client"
            />
        </div>
    );
};

export default ClientPaymentList;
