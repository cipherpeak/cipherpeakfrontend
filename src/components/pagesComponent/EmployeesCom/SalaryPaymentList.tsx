
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
import { cn } from '@/lib/utils';

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
        try {
            setLoading(true);
            const response = await axiosInstance.get(requests.SalaryPaymentList, {
                params: { employee_id: employeeId }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to fetch payment history');
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
            toast.success('Salary processed successfully');
            setIsProcessModalOpen(false);
            fetchPayments(); // Refresh list locally
            if (onUpdate) onUpdate(); // Optional parent refresh
        } catch (error) {
            console.error('Error processing salary:', error);
            toast.error('Failed to process salary');
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
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1] || 'Unknown';
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
            <Card className="shadow-md border-none ring-1 ring-black/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="p-2 bg-primary/10 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-primary" />
                            </span>
                            Salary Payment History
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage and track employee salary records</p>
                    </div>
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
                                            <TableCell className="font-semibold">₹{payment.net_amount}</TableCell>
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
