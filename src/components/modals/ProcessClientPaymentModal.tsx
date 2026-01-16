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
import { Loader2, DollarSign, CreditCard, Landmark, Wallet, Receipt } from 'lucide-react';

export interface PaymentData {
    amount: string;
    payment_method: string;
    transaction_id: string;
    remarks: string;
}

interface ProcessClientPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: PaymentData) => Promise<void>;
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
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm(formData);

    };

    const handleInputChange = (field: keyof PaymentData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Process Client Payment
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <Label htmlFor="amount">Monthly Retainer (₹) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-7 h-9"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="payment_method">Payment Method *</Label>
                        <Select
                            value={formData.payment_method}
                            onValueChange={(value) => handleInputChange('payment_method', value)}
                        >
                            <SelectTrigger className="h-9">
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

                    <div className="space-y-1">
                        <Label htmlFor="transaction_id">Transaction ID / Reference #</Label>
                        <Input
                            id="transaction_id"
                            placeholder="Enter reference number"
                            className="h-9"
                            value={formData.transaction_id}
                            onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="remarks">Notes / Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Any additional information..."
                            rows={2}
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
