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
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

interface UploadEmployeeMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (formData: FormData) => Promise<void>;
    isLoading: boolean;
}

const MEDIA_TYPES = [
    { value: 'profile_picture', label: 'Profile Picture' },
    { value: 'id_photo', label: 'ID Photo' },
    { value: 'id_card_photo', label: 'ID Card Photo' },
    { value: 'signature', label: 'Signature' },
    { value: 'work_sample', label: 'Work Sample' },
    { value: 'training_certificate', label: 'Training Certificate' },
    { value: 'award_certificate', label: 'Award Certificate' },
    { value: 'other', label: 'Other' },
];

const UploadEmployeeMediaModal = ({
    isOpen,
    onClose,
    onUpload,
    isLoading
}: UploadEmployeeMediaModalProps) => {
    const [mediaType, setMediaType] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !mediaType) {
            return;
        }

        const formData = new FormData();
        formData.append('media_type', mediaType);
        formData.append('file', file);

        console.log('Uploading media with:', {
            media_type: mediaType,
            file: file.name
        });

        await onUpload(formData);

        // Reset form
        setMediaType('');
        setFile(null);
    };

    const handleClose = () => {
        setMediaType('');
        setFile(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Employee Media
                    </DialogTitle>
                    <DialogDescription>
                        Upload photos and media files for this employee
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="media_type">Media Type *</Label>
                        <Select value={mediaType} onValueChange={setMediaType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select media type" />
                            </SelectTrigger>
                            <SelectContent>
                                {MEDIA_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Media File *</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                            accept="image/*,video/*"
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
                        <Button type="submit" disabled={isLoading || !file || !mediaType}>
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

export default UploadEmployeeMediaModal;
