import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, DollarSign, CreditCard, Landmark, Wallet, Receipt, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PaymentData {
    amount: string;
    payment_method: string;
    transaction_id: string;
    remarks: string;
    payment_date: string;
}

interface ProcessClientPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
    clientName: string;
    monthlyRetainer?: string;
    isLoading?: boolean;
}

const ProcessClientPaymentModal = ({
    isOpen,
    onClose,
    onConfirm,
    clientName,
    monthlyRetainer,
    isLoading = false,
}: ProcessClientPaymentModalProps) => {
    const [formData, setFormData] = useState<PaymentData>({
        amount: monthlyRetainer || '',
        payment_method: 'bank_transfer',
        transaction_id: '',
        remarks: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const [date, setDate] = useState<Date | undefined>(new Date());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm(formData);
    };

    const handleInputChange = (field: keyof PaymentData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            handleInputChange('payment_date', format(selectedDate, 'yyyy-MM-dd'));
        }
    };

    const paymentMethods = [
        { value: 'bank_transfer', label: 'Bank Transfer', icon: Landmark },
        { value: 'upi', label: 'UPI', icon: Wallet },
        { value: 'cash', label: 'Cash', icon: DollarSign },
        { value: 'cheque', label: 'Cheque', icon: Receipt },
        { value: 'online', label: 'Online Payment', icon: CreditCard },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <DollarSign className="h-6 w-6 text-emerald-500" />
                        Process Client Payment
                    </DialogTitle>
                    <DialogDescription>
                        Payment for {clientName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-7 h-10"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="payment_date">Payment Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-9",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="payment_method" className="text-sm font-medium">Payment Method *</Label>
                        <Select
                            value={formData.payment_method}
                            onValueChange={(value) => handleInputChange('payment_method', value)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                        <div className="flex items-center gap-2">
                                            <method.icon className="h-4 w-4" />
                                            <span>{method.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="transaction_id" className="text-sm font-medium">Transaction ID / Reference #</Label>
                        <Input
                            id="transaction_id"
                            placeholder="Enter reference number"
                            className="h-10"
                            value={formData.transaction_id}
                            onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="remarks" className="text-sm font-medium">Notes / Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Any additional information..."
                            rows={2}
                            className="resize-none"
                            value={formData.remarks}
                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Mark as Paid'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProcessClientPaymentModal;
