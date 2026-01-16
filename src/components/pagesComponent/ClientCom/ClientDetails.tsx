import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Phone,
  Loader2,
  Building,
  MapPin,
  FileText,
  Image,
  Download,
  IndianRupee,
  Calendar,
  Globe,
  Contact,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';


// ... existing imports ...
import ClientPaymentList from './ClientPaymentList';

// ... existing interfaces ...

// Removed AdminNote interface

interface ClientDocument {
  id: number;
  title: string;
  file: string;
  description?: string;
  document_type?: string;
  uploaded_by?: number | string | { username: string; email: string };
  uploaded_by_name?: string;
  created_at?: string;
  uploaded_at?: string;
}

interface Client {
  id: number;
  client_name: string;
  // ... (Client interface remains same)
  client_type: string;
  industry: string;
  status: 'active' | 'inactive' | 'on_hold' | 'terminated' | 'prospect';
  owner_name?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  description?: string;
  monthly_retainer?: string;
  videos_per_month: number;
  posters_per_month: number;
  reels_per_month: number;
  stories_per_month: number;
  onboarding_date: string;
  contract_start_date?: string;
  contract_end_date?: string;
  payment_cycle: string;
  payment_date: number;
  next_payment_date?: string;
  current_month_payment_status: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
  documents?: ClientDocument[];
}

interface ClientDetailsProps {
  selectedClient: Client | null;
  detailLoading: boolean;
  onBackToList: () => void;
  onEditClient: (client: Client) => void;
  onMarkPaymentPaid: (clientId: number) => void;
  onDownloadFile: (fileUrl: string, fileName: string) => void;
  onUploadDocument: (clientId: number, formData: FormData) => Promise<void>;
  onDocumentUploaded?: () => void; // Callback to refresh documents list
  onRefresh: () => void;
}

import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { backendUrl } from '@/components/Constants/Constants';

// Document type options based on your Django model
const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contract Agreement' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'brand_guidelines', label: 'Brand Guidelines' },
  { value: 'marketing_plan', label: 'Marketing Plan' },
  { value: 'performance_report', label: 'Performance Report' },
  { value: 'gst_document', label: 'GST Document' },
  { value: 'other', label: 'Other' },
];

const ClientDetails = ({
  selectedClient,
  detailLoading,
  onBackToList,
  onEditClient,
  onMarkPaymentPaid,
  onDownloadFile,
  onUploadDocument,
  onDocumentUploaded,
  onRefresh,
}: ClientDetailsProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>([]);
  const [uploadForm, setUploadForm] = useState({
    document_type: '',
    title: '',
    description: '',
    file: null as File | null,
  });
  // Removed adminNotes state
  const [processingPayment, setProcessingPayment] = useState(false);

  // Sync clientDocuments with selectedClient.documents
  useEffect(() => {
    if (selectedClient && selectedClient.documents) {
      setClientDocuments(selectedClient.documents);
    } else {
      setClientDocuments([]);
    }
  }, [selectedClient]);

  // Document fetch is handled by parent fetching client details now

  const getDocumentUrl = (docUrl: string) => {
    if (!docUrl) return '#';
    if (docUrl.startsWith('http')) return docUrl;
    // backendUrl ends with / usually
    return `${backendUrl}${docUrl.startsWith('/') ? docUrl.slice(1) : docUrl}`;
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await axiosInstance.delete(requests.ClientDocumentDelete(docId));
      toast.success('Document deleted successfully');
      // Update local state
      setClientDocuments(prev => prev.filter(doc => doc.id !== docId));
      // Call callback to refresh parent state if provided
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err: any) {
      console.error('Error deleting document:', err);
      toast.error(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedClient) return;
    setProcessingPayment(true);
    try {
      if (onMarkPaymentPaid) {
        await (onMarkPaymentPaid(selectedClient.id) as any);
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  // API call to delete a document - DISABLED (No endpoint provided)



  // Safe getInitials function
  const getInitials = (name: string | undefined | null): string => {
    if (!name) return 'CL';

    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'on_hold':
      case 'on hold': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800';
      case 'inactive':
      case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getIndustryColor = (industry: string) => {
    if (!industry) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800',
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800',
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:border-pink-800',
    ];
    const hash = industry.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocation = (client: Client): string => {
    const locationParts = [client.city, client.state, client.country].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
  };

  const getContactPerson = (client: Client): string => {
    return client.contact_person_name || client.owner_name || 'Contact not specified';
  };

  const getTotalContent = (client: Client): number => {
    return (client.videos_per_month || 0) +
      (client.posters_per_month || 0) +
      (client.reels_per_month || 0) +
      (client.stories_per_month || 0);
  };

  const getPaymentCycleDisplay = (cycle: string): string => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      case 'custom': return 'Custom';
      default: return cycle;
    }
  };

  const getPaymentDateDisplay = (date: number): string => {
    if (date === 1) return '1st';
    if (date === 2) return '2nd';
    if (date === 3) return '3rd';
    return `${date}th`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a JPG, PNG, or PDF file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      setUploadError(null);
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !uploadForm.file) {
      setUploadError('Please fill all required fields');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document_type', uploadForm.document_type);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description || '');
      formData.append('file', uploadForm.file);
      formData.append('client', selectedClient.id.toString());

      // Call the API using axiosInstance
      const response = await axiosInstance.post(
        requests.ClientUploadDocument(selectedClient.id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total ?
              (progressEvent.loaded / progressEvent.total) * 100 : 0;
            setUploadProgress(progress);
          },
        }
      );

      console.log('Document uploaded successfully:', response.data);

      // Add the new document to local state
      // setClientDocuments(prev => [response.data, ...prev]);

      // Call the parent handler if provided
      if (onUploadDocument) {
        await onUploadDocument(selectedClient.id, formData);
      }

      // Call the callback to refresh documents list
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }

      if (onRefresh) {
        onRefresh();
      }

      // Reset form and close modal
      resetUploadForm();
      setIsUploadModalOpen(false);

    } catch (error: any) {
      console.error('Error uploading document:', error);
      setUploadError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to upload document. Please try again.'
      );
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      document_type: '',
      title: '',
      description: '',
      file: null,
    });
    setUploadError(null);
    setUploadProgress(0);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    resetUploadForm();
  };

  const StatCard = ({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) => (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No client data available</p>
          <Button onClick={onBackToList} className="mt-4">
            Back to Client List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border/40 sticky top-0 bg-white dark:bg-gray-900 rounded-t-lg">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUploadModalClose}
                disabled={uploadLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading document...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  disabled={uploadLoading}
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter document title"
                  disabled={uploadLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Enter document description (optional)"
                  disabled={uploadLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  disabled={uploadLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: JPG, PNG, PDF (Max: 10MB)
                </p>
                {uploadForm.file && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {uploadForm.file.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleUploadModalClose}
                  disabled={uploadLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploadLoading || !uploadForm.document_type || !uploadForm.title || !uploadForm.file}
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {getInitials(selectedClient.client_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{selectedClient.client_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Contact className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg text-muted-foreground">
                        {getContactPerson(selectedClient)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg text-muted-foreground">
                        {selectedClient.industry || 'Industry not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                  <Badge variant="outline" className={`text-base py-1.5 px-3 ${getStatusColor(selectedClient.status)}`}>
                    {formatStatus(selectedClient.status)}
                  </Badge>
                  <Badge variant="outline" className={`text-base py-1.5 px-3 ${getPaymentStatusColor(selectedClient.current_month_payment_status)}`}>
                    Payment: {formatStatus(selectedClient.current_month_payment_status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Content/Month"
          value={getTotalContent(selectedClient).toString()}
        />
        <StatCard
          icon={IndianRupee}
          label="Monthly Retainer"
          value={selectedClient.monthly_retainer ? `₹${selectedClient.monthly_retainer}` : 'Not set'}
        />
        <StatCard
          icon={Calendar}
          label="Next Payment"
          value={selectedClient.next_payment_date ? formatDate(selectedClient.next_payment_date) : 'Not set'}
        />
        <StatCard
          icon={MapPin}
          label="Location"
          value={getLocation(selectedClient)}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
            <Building className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2 py-3">
            <CreditCard className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClient.contact_email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedClient.contact_email}</p>
                    </div>
                  </div>
                )}
                {selectedClient.contact_phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedClient.contact_phone}</p>
                    </div>
                  </div>
                )}
                {selectedClient.website && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={selectedClient.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {selectedClient.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {getLocation(selectedClient)}
                      {selectedClient.address && (
                        <>
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {selectedClient.address}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <Badge className={`mt-1 ${getIndustryColor(selectedClient.industry)}`}>
                      {selectedClient.industry || 'Not specified'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client Type</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedClient.client_type}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Content/Month</p>
                    <p className="font-medium text-2xl mt-1">{getTotalContent(selectedClient)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Retainer</p>
                    <p className="font-medium text-2xl text-green-600 mt-1">
                      {selectedClient.monthly_retainer ? `₹${selectedClient.monthly_retainer}` : 'Not set'}
                    </p>
                  </div>
                </div>

                {selectedClient.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{selectedClient.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Tab */}


        {/* Payment Tab */}
        < TabsContent value="payment" className="space-y-6 mt-6" >
          <ClientPaymentList
            clientId={selectedClient.id}
            clientName={selectedClient.client_name}
            monthlyRetainer={selectedClient.monthly_retainer}
            onUpdate={onRefresh}
          />
        </TabsContent >

        {/* Content Tab */}
        < TabsContent value="content" className="space-y-6 mt-6" >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Monthly Content Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{selectedClient.videos_per_month}</p>
                  <p className="text-sm text-muted-foreground">Videos/Month</p>
                </Card>
                <Card className="text-center p-4">
                  <Image className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{selectedClient.posters_per_month}</p>
                  <p className="text-sm text-muted-foreground">Posters/Month</p>
                </Card>
                <Card className="text-center p-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{selectedClient.reels_per_month}</p>
                  <p className="text-sm text-muted-foreground">Reels/Month</p>
                </Card>
                <Card className="text-center p-4">
                  <Image className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{selectedClient.stories_per_month}</p>
                  <p className="text-sm text-muted-foreground">Stories/Month</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent >

        {/* Documents Tab */}
        < TabsContent value="documents" className="space-y-6 mt-6" >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({clientDocuments.length})
                </CardTitle>
                {documentsLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={documentsLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${documentsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {documentsError}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="ml-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {documentsLoading && clientDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : clientDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientDocuments.map((doc) => (
                    <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded by {doc.uploaded_by_name || (typeof doc.uploaded_by === 'object' ? doc.uploaded_by.username : doc.uploaded_by) || 'Unknown'} on {formatDate(doc.created_at || doc.uploaded_at || '')}
                            </p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-4">
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                              <a href={getDocumentUrl(doc.file)} target="_blank" rel="noopener noreferrer" title="View">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents available</p>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent >


      </Tabs >
    </div >
  );
};

export default ClientDetails;
