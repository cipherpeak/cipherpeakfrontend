import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

interface UploadEmployeeDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (formData: FormData) => Promise<void>;
    isLoading: boolean;
}

const DOCUMENT_TYPES = [
    { value: 'resume', label: 'Resume/CV' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'joining_letter', label: 'Joining Letter' },
    { value: 'id_proof', label: 'ID Proof' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'educational_certificate', label: 'Educational Certificate' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'bank_details', label: 'Bank Details' },
    { value: 'pf_documents', label: 'PF Documents' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' },
];

const UploadEmployeeDocumentModal = ({
    isOpen,
    onClose,
    onUpload,
    isLoading
}: UploadEmployeeDocumentModalProps) => {
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !documentType) {
            return;
        }

        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('file', file);

        await onUpload(formData);

        // Reset form
        setDocumentType('');
        setFile(null);
    };

    const handleClose = () => {
        setDocumentType('');
        setFile(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Employee Document
                    </DialogTitle>
                    <DialogDescription>
                        Upload official documents for this employee
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="document_type">Document Type *</Label>
                        <Select value={documentType} onValueChange={setDocumentType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Document File *</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {file && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !file || !documentType}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UploadEmployeeDocumentModal;
