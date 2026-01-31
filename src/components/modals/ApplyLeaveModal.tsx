// components/modals/ApplyLeaveModal.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Paperclip, X, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ApplyLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyLeave?: (leaveData: LeaveFormData) => void;
  onSuccess?: () => void;
  mode?: 'apply' | 'edit';
  leaveToEdit?: any;
}

export interface LeaveFormData {
  category: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  totalDays: number;
  reason: string;
  attachment: File | null;
  addressDuringLeave: string;
}

const leaveCategories = [
  { value: 'Annual Leave', label: 'Annual Leave' },
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Bereavement Leave', label: 'Bereavement Leave' },
  { value: 'LOP', label: 'Leave Without Pay (LOP)' },
  { value: 'WFH', label: 'Work From Home (WFH)' },
];

const ApplyLeaveModal = ({ open, onOpenChange, onApplyLeave, onSuccess, mode = 'apply', leaveToEdit }: ApplyLeaveModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<LeaveFormData>({
    category: '',
    fromDate: undefined,
    toDate: undefined,
    totalDays: 0,
    reason: '',
    attachment: null,
    addressDuringLeave: '',
  });


  // Effect to populate form when in edit mode
  useEffect(() => {
    if (mode === 'edit' && leaveToEdit && open) {
      setFormData({
        category: leaveToEdit.category || '',
        fromDate: leaveToEdit.fromDate ? new Date(leaveToEdit.fromDate) : undefined,
        toDate: leaveToEdit.toDate ? new Date(leaveToEdit.toDate) : undefined,
        totalDays: parseFloat(leaveToEdit.totalDays) || 0,
        reason: leaveToEdit.reason || '',
        addressDuringLeave: leaveToEdit.address_during_leave || '',
        attachment: null, // We typically don't set file input values from URL
      });
    } else if (mode === 'apply' && open) {
      setFormData({
        category: '',
        fromDate: undefined,
        toDate: undefined,
        totalDays: 0,
        reason: '',
        attachment: null,
        addressDuringLeave: '',
      });
    }
  }, [mode, leaveToEdit, open]);

  const calculateTotalDays = (from: Date | undefined, to: Date | undefined) => {
    if (!from || !to) return 0;
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDateChange = (type: 'from' | 'to', date: Date | undefined) => {
    if (type === 'from') {
      setFormData(prev => {
        const newFromDate = date;
        const totalDays = calculateTotalDays(newFromDate, prev.toDate);
        return { ...prev, fromDate: newFromDate, totalDays };
      });
    } else {
      setFormData(prev => {
        const newToDate = date;
        const totalDays = calculateTotalDays(prev.fromDate, newToDate);
        return { ...prev, toDate: newToDate, totalDays };
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create FormData if there's an attachment
      const data = new FormData();
      data.append('category', formData.category);
      if (formData.fromDate) data.append('start_date', format(formData.fromDate, 'yyyy-MM-dd'));
      if (formData.toDate) data.append('end_date', format(formData.toDate, 'yyyy-MM-dd'));
      data.append('total_days', formData.totalDays.toString());
      data.append('reason', formData.reason);
      data.append('address_during_leave', formData.addressDuringLeave);
      if (formData.attachment) {
        data.append('attachment', formData.attachment);
      }

      if (mode === 'apply') {
        await axiosInstance.post(requests.LeaveCreate, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast({
          title: 'Success',
          description: 'Leave request submitted successfully',
        });
      } else {
        await axiosInstance.put(requests.LeaveDetail(leaveToEdit.id), data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast({
          title: 'Success',
          description: 'Leave request updated successfully',
        });
      }

      if (onSuccess) onSuccess();
      if (onApplyLeave) onApplyLeave(formData);

      setFormData({
        category: '',
        fromDate: undefined,
        toDate: undefined,
        totalDays: 0,
        reason: '',
        attachment: null,
        addressDuringLeave: '',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error applying for leave:', error);
      const errorData = error.response?.data;
      console.log("DEBUG: Backend Error Details:", errorData);
      let errorMessage = 'Failed to submit leave request';

      if (errorData && typeof errorData === 'object') {
        errorMessage = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join(' | ');
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'apply' ? 'Apply for Leave' : 'Edit Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'apply'
              ? 'Fill in the details below to apply for leave. All fields marked with * are required.'
              : 'Update the details of your leave request below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Leave Category */}
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Category of Leave *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave category" />
                </SelectTrigger>
                <SelectContent>
                  {leaveCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fromDate ? format(formData.fromDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fromDate}
                      onSelect={(date) => handleDateChange('from', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.toDate ? format(formData.toDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.toDate}
                      onSelect={(date) => handleDateChange('to', date)}
                      disabled={(date) => formData.fromDate ? date < formData.fromDate : date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>



            {/* Total Days */}
            <div className="grid gap-2">
              <Label htmlFor="totalDays" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Total Number of Leave Days
              </Label>
              <Input
                id="totalDays"
                type="number"
                value={formData.totalDays || ''}
                readOnly
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Calculated automatically based on selected dates
              </p>
            </div>

            {/* Reason for Leave */}
            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Reason for Leave *
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide details about your leave request..."
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Address During Leave */}
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Address During Leave
              </Label>
              <Textarea
                id="address"
                placeholder="Enter your address during leave..."
                value={formData.addressDuringLeave}
                onChange={(e) => setFormData(prev => ({ ...prev, addressDuringLeave: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>



            {/* Attach Media */}
            <div className="grid gap-2">
              <Label htmlFor="attachment" className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Attach Supporting Documents
              </Label>
              {formData.attachment ? (
                <div className="flex items-center gap-4 p-4 bg-[#f8fbff] rounded-lg border border-[#edf3f9]">
                  <div className="w-10 h-10 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-[#42a5f5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#333]">{formData.attachment.name}</p>
                    <p className="text-[11px] font-semibold text-gray-400">
                      {(formData.attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0 rounded-lg bg-white border-[#edf3f9] text-gray-400 shadow-sm hover:text-[#42a5f5]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Label
                    htmlFor="attachment-upload"
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    Click to upload file
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG up to 5MB
                  </p>
                  <Input
                    id="attachment-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading || !formData.category || !formData.fromDate || !formData.toDate || !formData.reason}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Leave Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeaveModal;