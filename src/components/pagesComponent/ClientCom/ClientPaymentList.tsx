
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        Usage & Payment History
                    </CardTitle>
                    <Button onClick={() => setIsProcessModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Process Payment
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : payments && payments.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {getMonthName(payment.month)} {payment.year}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(payment.payment_date)}
                                            </TableCell>
                                            <TableCell>₹{payment.net_amount}</TableCell>
                                            <TableCell className="capitalize">
                                                {(payment.payment_method || '-').replace('_', ' ')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(payment.status)}>
                                                    {payment.status_display}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetail(payment.id)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
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
