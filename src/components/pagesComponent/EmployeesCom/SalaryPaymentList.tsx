
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
    Plus
} from 'lucide-react';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';
import ProcessSalaryModal, { SalaryPaymentData } from '@/components/modals/ProcessSalaryModal';
import PaymentDetailModal from '@/components/modals/PaymentDetailModal';

interface SalaryPayment {
    id: number;
    month: number;
    year: number;
    base_salary: string;
    incentives: string;
    deductions: string;
    net_amount: string;
    payment_date: string;
    status: string;
    status_display: string;
    payment_method: string;
}

interface SalaryPaymentListProps {
    employeeId: number;
    employeeName: string;
    salary: string;
    // Removed payments prop as we will fetch them
    onUpdate?: () => void;
}

const SalaryPaymentList = ({ employeeId, employeeName, salary, onUpdate }: SalaryPaymentListProps) => {
    const [payments, setPayments] = useState<SalaryPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchPayments = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            // Now fetching with employee_id query param as backend supports it
            const response = await axiosInstance.get(`${requests.SalaryPaymentList}?employee_id=${employeeId}`);
            setPayments(response.data);
        } catch (err) {
            console.error('Error fetching salary payments:', err);
            toast.error('Failed to load salary history');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [employeeId]);

    const handleProcessPayment = async (data: SalaryPaymentData) => {
        setProcessing(true);
        try {
            await axiosInstance.post(requests.ProcessSalaryPayment(employeeId), data);
            toast.success('Salary payment processed successfully');
            setIsProcessModalOpen(false);
            fetchPayments(); // Refresh list locally
            if (onUpdate) onUpdate(); // Optional parent refresh
        } catch (err: any) {
            console.error('Error processing payment:', err);
            toast.error(err.response?.data?.error || 'Failed to process salary payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleViewDetail = (id: number) => {
        setSelectedPaymentId(id);
        setIsDetailModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'early_paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'short' });
    };

    const formatDate = (dateString: string) => {
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
                        Salary Payment History
                    </CardTitle>
                    <Button onClick={() => setIsProcessModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Process Salary
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
                            <p className="text-sm">Process a salary payment to see it here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ProcessSalaryModal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                onConfirm={handleProcessPayment}
                employeeName={employeeName}
                defaultSalary={salary}
                isLoading={processing}
            />

            <PaymentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPaymentId(null);
                }}
                title="Salary Payment Details"
                paymentId={selectedPaymentId}
                type="employee"
            />
        </div>
    );
};

export default SalaryPaymentList;
