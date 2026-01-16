import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    CreditCard,
    User,
    Tag,
    FileText,
    IndianRupee,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "@/axios/axios";
import { requests } from "@/lib/urls";

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    paymentId: number | null;
    type: 'client' | 'employee';
}

const PaymentDetailModal = ({ isOpen, onClose, title, paymentId, type }: PaymentDetailModalProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!isOpen || !paymentId) return;

            setLoading(true);
            setError(null);
            try {
                const endpoint = type === 'employee'
                    ? requests.PaymentDetail(paymentId)
                    : requests.ClientPaymentDetail(paymentId);

                const response = await axiosInstance.get(endpoint);
                setData(response.data);
            } catch (err: any) {
                console.error('Error fetching payment details:', err);
                setError(err.response?.data?.error || 'Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [isOpen, paymentId, type]);

    if (!isOpen) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        const s = status.toLowerCase();
        if (s.includes('paid') || s.includes('received')) return 'bg-green-100 text-green-800 border-green-200';
        if (s.includes('overdue')) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="space-y-1 pb-1">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    {data && (
                        <DialogDescription className="text-xs">
                            Payment period: <span className="font-semibold">{getMonthName(data.month)} {data.year}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-xs text-muted-foreground">Loading payment details...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-2">
                            <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                            <p className="text-xs text-destructive font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && data && (
                    <div className="space-y-3 py-1">
                        {/* Status and Amount Card */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Net Amount</p>
                                <p className="text-2xl font-bold text-primary">₹{data.net_amount}</p>
                            </div>
                            <Badge className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(data.status_display || data.status)}`}>
                                {(data.status_display || data.status || '').replace('_', ' ')}
                            </Badge>
                        </div>

                        {/* Breakdown and Schedule Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Payment Breakdown Section */}
                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                                <h4 className="text-[10px] font-bold flex items-center gap-1 text-foreground uppercase tracking-wide">
                                    <Tag className="h-3 w-3 text-primary" />
                                    Breakdown
                                </h4>
                                <div className="space-y-1.5">
                                    {type === 'client' ? (
                                        <>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Base Amount</span>
                                                <span className="font-semibold">₹{data.amount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Tax</span>
                                                <span className="text-red-600 font-semibold">+₹{data.tax_amount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Discount</span>
                                                <span className="text-green-600 font-semibold">-₹{data.discount}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Base Salary</span>
                                                <span className="font-semibold">₹{data.base_salary}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Incentives</span>
                                                <span className="text-green-600 font-semibold">+₹{data.incentives}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Deductions</span>
                                                <span className="text-red-600 font-semibold">-₹{data.deductions}</span>
                                            </div>
                                        </>
                                    )}
                                    <Separator className="my-1" />
                                    <div className="flex justify-between items-center text-sm font-bold pt-0.5">
                                        <span>Total</span>
                                        <span className="text-primary">₹{data.net_amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                                <h4 className="text-[10px] font-bold flex items-center gap-1 text-foreground uppercase tracking-wide">
                                    <Clock className="h-3 w-3 text-primary" />
                                    Schedule
                                </h4>
                                <div className="space-y-2">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Paid Date</p>
                                        <p className="text-xs font-semibold flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-primary" />
                                            {formatDate(data.payment_date)}
                                        </p>
                                    </div>
                                    {type === 'client' && (
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Due Date</p>
                                            <p className="text-xs font-semibold flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-amber-600" />
                                                {formatDate(data.scheduled_date)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Method</p>
                                        <p className="text-xs font-semibold capitalize flex items-center gap-1">
                                            <CreditCard className="h-3 w-3 text-primary" />
                                            {(data.payment_method || 'N/A').replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Card */}
                        <div className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                                        <User className="h-3 w-3" />
                                        Processed By
                                    </p>
                                    <p className="text-xs font-semibold">{data.processed_by_name || 'System'}</p>
                                </div>
                                {type === 'client' && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground font-semibold">Transaction ID</p>
                                        <p className="text-xs font-mono font-semibold truncate max-w-[180px]" title={data.transaction_id}>
                                            {data.transaction_id || 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {data.remarks && (
                                <div className="space-y-1 pt-1.5 border-t">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1 tracking-wide">
                                        <FileText className="h-2.5 w-2.5" />
                                        Remarks
                                    </p>
                                    <p className="text-xs text-foreground/80 italic leading-snug bg-muted/40 p-1.5 rounded">"{data.remarks}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentDetailModal;
