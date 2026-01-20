
import { useState, useEffect } from 'react';
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
import { Loader2, DollarSign, CreditCard, Landmark, Wallet, Receipt, Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface SalaryPaymentData {
    base_salary: string;
    incentives: string;
    deductions: string;
    payment_method: string;
    remarks: string;
    payment_date: string;
}

interface ProcessSalaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: SalaryPaymentData) => Promise<void>;
    employeeName: string;
    defaultSalary?: string;
    preSelectedDate?: Date;
    isLoading?: boolean;
}

const ProcessSalaryModal = ({
    isOpen,
    onClose,
    onConfirm,
    employeeName,
    defaultSalary,
    preSelectedDate,
    isLoading = false,
}: ProcessSalaryModalProps) => {
    const [formData, setFormData] = useState<SalaryPaymentData>({
        base_salary: defaultSalary || '',
        incentives: '0',
        deductions: '0',
        payment_method: 'bank_transfer',
        remarks: '',
        payment_date: preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    });

    const [date, setDate] = useState<Date | undefined>(preSelectedDate || new Date());

    const [netAmount, setNetAmount] = useState<number>(0);

    useEffect(() => {
        if (defaultSalary) {
            setFormData(prev => ({ ...prev, base_salary: defaultSalary }));
        }
    }, [defaultSalary]);

    useEffect(() => {
        if (preSelectedDate) {
            setDate(preSelectedDate);
            setFormData(prev => ({
                ...prev,
                payment_date: format(preSelectedDate, 'yyyy-MM-dd')
            }));
        }
    }, [preSelectedDate]);

    useEffect(() => {
        const base = parseFloat(formData.base_salary) || 0;
        const inc = parseFloat(formData.incentives) || 0;
        const ded = parseFloat(formData.deductions) || 0;
        setNetAmount(base + inc - ded);
    }, [formData.base_salary, formData.incentives, formData.deductions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm(formData);
    };

    const handleInputChange = (field: keyof SalaryPaymentData, value: string) => {
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Process Salary Payment
                    </DialogTitle>
                    <DialogDescription>
                        Processing for <strong>{employeeName}</strong>. Period will be auto-detected.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="base_salary" className="text-xs">Base Salary (₹) *</Label>
                            <Input
                                id="base_salary"
                                type="number"
                                placeholder="0.00"
                                className="h-9"
                                value={formData.base_salary}
                                onChange={(e) => handleInputChange('base_salary', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="payment_method" className="text-xs">Payment Method *</Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={(value) => handleInputChange('payment_method', value)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            <div className="flex items-center gap-2">
                                                <method.icon className="h-3 w-3" />
                                                <span className="text-sm">{method.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="payment_date" className="text-xs">Payment Date *</Label>
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
                                        {date ? format(date, "PPP") : <span className="text-sm">Pick a date</span>}
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="incentives" className="text-green-600 text-xs">Incentives (₹)</Label>
                            <Input
                                id="incentives"
                                type="number"
                                placeholder="0.00"
                                className="h-9"
                                value={formData.incentives}
                                onChange={(e) => handleInputChange('incentives', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="deductions" className="text-red-600 text-xs">Deductions (₹)</Label>
                            <Input
                                id="deductions"
                                type="number"
                                placeholder="0.00"
                                className="h-9"
                                value={formData.deductions}
                                onChange={(e) => handleInputChange('deductions', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-2.5 bg-muted/50 rounded-lg flex items-center justify-between border">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-xs">Net Payable</span>
                        </div>
                        <span className="text-lg font-bold text-primary">₹{netAmount.toFixed(2)}</span>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="remarks" className="text-xs">Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Optional notes..."
                            rows={2}
                            className="min-h-[60px] resize-none"
                            value={formData.remarks}
                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Process Payment'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProcessSalaryModal;
