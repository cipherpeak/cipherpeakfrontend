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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Building, User, MapPin, FileText, BarChart3, DollarSign, Calendar, CreditCard, Clock, AlertCircle } from 'lucide-react';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';
import { log } from 'console';

interface Client {
  id: number;
  client_name: string;
  client_type: string;
  industry: string;
  owner_name: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
  instagram_id: string;
  facebook_id: string;
  youtube_channel: string;
  google_my_business: string;
  linkedin_url: string;
  twitter_handle: string;
  videos_per_month: number;
  posters_per_month: number;
  reels_per_month: number;
  stories_per_month: number;
  status: string;
  onboarding_date: string;
  contract_start_date: string;
  contract_end_date: string;
  // Payment Fields
  payment_cycle: string;
  payment_date: number;
  next_payment_date: string;
  current_month_payment_status: string;
  last_payment_date: string;
  monthly_retainer: string;
  // New Payment Timing Fields
  payment_timing: string;
  early_payment_date: string;
  early_payment_amount: string;
  early_payment_notes: string;
  // Location and Business
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  website: string;
  business_registration_number: string;
  tax_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  // Read-only properties
  total_content_per_month?: number;
  is_active_client?: boolean;
  contract_duration?: number;
  is_payment_overdue?: boolean;
  days_until_next_payment?: number;
  payment_status_display?: string;
  is_early_payment?: boolean;
  early_payment_days?: number;
}

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: () => void;
  onClientUpdated: () => void;
  clientToEdit?: Client | null;
  mode: 'add' | 'edit';
}

const AddClientModal = ({ 
  open, 
  onOpenChange, 
  onClientAdded,
  onClientUpdated,
  clientToEdit,
  mode 
}: AddClientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showEarlyPaymentSection, setShowEarlyPaymentSection] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    client_name: '',
    client_type: 'company',
    industry: '',
    status: 'prospect',
    description: '',
    
    // Contact Information
    owner_name: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
    
    // Social Media
    instagram_id: '',
    facebook_id: '',
    youtube_channel: '',
    google_my_business: '',
    linkedin_url: '',
    twitter_handle: '',
    
    // Content Requirements
    videos_per_month: 0,
    posters_per_month: 0,
    reels_per_month: 0,
    stories_per_month: 0,
    
    // Contract & Timeline
    onboarding_date: new Date().toISOString().split('T')[0],
    contract_start_date: '',
    contract_end_date: '',
    
    // Payment Information
    payment_cycle: 'monthly',
    payment_date: 1,
    current_month_payment_status: 'pending',
    monthly_retainer: '',
    
    // New Payment Timing Fields
    payment_timing: 'on_time',
    early_payment_date: '',
    early_payment_amount: '',
    early_payment_notes: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    
    // Business Information
    website: '',
    business_registration_number: '',
    tax_id: '',
  });

  // Constants matching Django model choices
  const clientTypes = [
    { value: 'company', label: 'Company' },
    { value: 'brand', label: 'Brand' },
    { value: 'individual', label: 'Individual' },
    { value: 'agency', label: 'Agency' },
  ];

  const industries = [
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'beauty', label: 'Beauty & Cosmetics' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'technology', label: 'Technology' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'prospect', label: 'Prospect' },
  ];

  const paymentCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ];

  const paymentStatuses = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'early_paid', label: 'Early Paid' }, // New status
  ];

  const paymentTimingOptions = [
    { value: 'early', label: 'Early' },
    { value: 'on_time', label: 'On Time' },
    { value: 'late', label: 'Late' },
  ];

  // Generate payment dates (1-31)
  const paymentDates = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`
  }));


  

  // Initialize form data
  useEffect(() => {
    if (clientToEdit && mode === 'edit') {
      setFormData({
        client_name: clientToEdit.client_name || '',
        client_type: clientToEdit.client_type || 'company',
        industry: clientToEdit.industry || '',
        status: clientToEdit.status || 'prospect',
        description: clientToEdit.description || '',
        owner_name: clientToEdit.owner_name || '',
        contact_person_name: clientToEdit.contact_person_name || '',
        contact_email: clientToEdit.contact_email || '',
        contact_phone: clientToEdit.contact_phone || '',
        instagram_id: clientToEdit.instagram_id || '',
        facebook_id: clientToEdit.facebook_id || '',
        youtube_channel: clientToEdit.youtube_channel || '',
        google_my_business: clientToEdit.google_my_business || '',
        linkedin_url: clientToEdit.linkedin_url || '',
        twitter_handle: clientToEdit.twitter_handle || '',
        videos_per_month: clientToEdit.videos_per_month || 0,
        posters_per_month: clientToEdit.posters_per_month || 0,
        reels_per_month: clientToEdit.reels_per_month || 0,
        stories_per_month: clientToEdit.stories_per_month || 0,
        onboarding_date: clientToEdit.onboarding_date || new Date().toISOString().split('T')[0],
        contract_start_date: clientToEdit.contract_start_date || '',
        contract_end_date: clientToEdit.contract_end_date || '',
        payment_cycle: clientToEdit.payment_cycle || 'monthly',
        payment_date: clientToEdit.payment_date || 1,
        current_month_payment_status: clientToEdit.current_month_payment_status || 'pending',
        monthly_retainer: clientToEdit.monthly_retainer || '',
        payment_timing: clientToEdit.payment_timing || 'on_time',
        early_payment_date: clientToEdit.early_payment_date || '',
        early_payment_amount: clientToEdit.early_payment_amount || '',
        early_payment_notes: clientToEdit.early_payment_notes || '',
        address: clientToEdit.address || '',
        city: clientToEdit.city || '',
        state: clientToEdit.state || '',
        country: clientToEdit.country || '',
        postal_code: clientToEdit.postal_code || '',
        website: clientToEdit.website || '',
        business_registration_number: clientToEdit.business_registration_number || '',
        tax_id: clientToEdit.tax_id || '',
      });
      
      // Show early payment section if there's early payment data
      if (clientToEdit.early_payment_date || clientToEdit.current_month_payment_status === 'early_paid') {
        setShowEarlyPaymentSection(true);
      }
    } else {
      setFormData({
        client_name: '',
        client_type: 'company',
        industry: '',
        status: 'prospect',
        description: '',
        owner_name: '',
        contact_person_name: '',
        contact_email: '',
        contact_phone: '',
        instagram_id: '',
        facebook_id: '',
        youtube_channel: '',
        google_my_business: '',
        linkedin_url: '',
        twitter_handle: '',
        videos_per_month: 0,
        posters_per_month: 0,
        reels_per_month: 0,
        stories_per_month: 0,
        onboarding_date: new Date().toISOString().split('T')[0],
        contract_start_date: '',
        contract_end_date: '',
        payment_cycle: 'monthly',
        payment_date: 1,
        current_month_payment_status: 'pending',
        monthly_retainer: '',
        payment_timing: 'on_time',
        early_payment_date: '',
        early_payment_amount: '',
        early_payment_notes: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        website: '',
        business_registration_number: '',
        tax_id: '',
      });
      setShowEarlyPaymentSection(false);
    }
    setActiveTab('basic');
  }, [clientToEdit, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendData = {
        ...formData,
        videos_per_month: parseInt(formData.videos_per_month.toString()),
        posters_per_month: parseInt(formData.posters_per_month.toString()),
        reels_per_month: parseInt(formData.reels_per_month.toString()),
        stories_per_month: parseInt(formData.stories_per_month.toString()),
        payment_date: parseInt(formData.payment_date.toString()),
        monthly_retainer: formData.monthly_retainer ? parseFloat(formData.monthly_retainer.toString()) : null,
        early_payment_amount: formData.early_payment_amount ? parseFloat(formData.early_payment_amount.toString()) : null,
        // Clear dates if empty
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        early_payment_date: formData.early_payment_date || null,
      };

      if (mode === 'add') {
       const response = await axiosInstance.post(requests.CreateClient, backendData);
       console.log(response,"this is response");
       
        onClientAdded();
      } else {
        await axiosInstance.put(`${requests.UpdateClient}${clientToEdit?.id}/`, backendData);
        onClientUpdated();
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving client:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || `Failed to ${mode} client`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarkEarlyPayment = async () => {
    if (!clientToEdit) return;
    
    setLoading(true);
    try {
      await axiosInstance.post(`${requests.EarlyPaid}${clientToEdit.id}/mark-early-payment/`, {
        payment_date: formData.early_payment_date || new Date().toISOString().split('T')[0],
        amount: formData.early_payment_amount || formData.monthly_retainer,
        notes: formData.early_payment_notes
      });
      
      onClientUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error marking early payment:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to mark early payment';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalContent = () => {
    return formData.videos_per_month + formData.posters_per_month + 
           formData.reels_per_month + formData.stories_per_month;
  };

  const getPaymentCycleDescription = () => {
    switch (formData.payment_cycle) {
      case 'monthly':
        return 'Payment due every month';
      case 'quarterly':
        return 'Payment due every 3 months';
      case 'yearly':
        return 'Payment due once per year';
      case 'custom':
        return 'Custom payment schedule';
      default:
        return '';
    }
  };

  const getPaymentTimingDescription = () => {
    switch (formData.payment_timing) {
      case 'early':
        return 'Payment was made before due date';
      case 'on_time':
        return 'Payment was made on due date';
      case 'late':
        return 'Payment was made after due date';
      default:
        return '';
    }
  };

  const isEarlyPaymentEligible = () => {
    return mode === 'edit' && 
           clientToEdit && 
           clientToEdit.current_month_payment_status !== 'paid' && 
           clientToEdit.current_month_payment_status !== 'early_paid';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {mode === 'add' ? 'Add New Client' : 'Edit Client'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Complete all sections to add a new client to your portfolio.'
              : 'Update client information across all sections.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Business
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-6">
              {/* ... Basic Information Tab (unchanged) ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Core client details and classification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      placeholder="Enter client/company name..."
                      value={formData.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client_type">Client Type *</Label>
                      <Select
                        value={formData.client_type}
                        onValueChange={(value) => handleInputChange('client_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client type" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Client Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the client's business, goals, and requirements..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              {/* ... Contact Information Tab (unchanged) ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Primary contacts and business representatives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner_name">Owner Name</Label>
                      <Input
                        id="owner_name"
                        placeholder="Business owner name..."
                        value={formData.owner_name}
                        onChange={(e) => handleInputChange('owner_name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_person_name">Contact Person</Label>
                      <Input
                        id="contact_person_name"
                        placeholder="Primary contact person..."
                        value={formData.contact_person_name}
                        onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email Address</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="contact@company.com"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              {/* ... Social Media Tab (unchanged) ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Profiles</CardTitle>
                  <CardDescription>Client's social media handles and channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram_id">Instagram ID/Handle</Label>
                      <Input
                        id="instagram_id"
                        placeholder="@username"
                        value={formData.instagram_id}
                        onChange={(e) => handleInputChange('instagram_id', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook_id">Facebook ID/Page</Label>
                      <Input
                        id="facebook_id"
                        placeholder="Facebook page name or ID"
                        value={formData.facebook_id}
                        onChange={(e) => handleInputChange('facebook_id', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtube_channel">YouTube Channel</Label>
                      <Input
                        id="youtube_channel"
                        placeholder="YouTube channel name or ID"
                        value={formData.youtube_channel}
                        onChange={(e) => handleInputChange('youtube_channel', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="google_my_business">Google My Business</Label>
                      <Input
                        id="google_my_business"
                        placeholder="Google My Business name"
                        value={formData.google_my_business}
                        onChange={(e) => handleInputChange('google_my_business', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        placeholder="https://linkedin.com/company/..."
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter_handle">Twitter Handle</Label>
                      <Input
                        id="twitter_handle"
                        placeholder="@username"
                        value={formData.twitter_handle}
                        onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* ... Content Requirements Tab (unchanged) ... */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Content Requirements</span>
                    <Badge variant="secondary">
                      Total: {calculateTotalContent()} pieces/month
                    </Badge>
                  </CardTitle>
                  <CardDescription>Monthly content delivery targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="videos_per_month">Videos/Month</Label>
                      <Input
                        id="videos_per_month"
                        type="number"
                        min="0"
                        value={formData.videos_per_month}
                        onChange={(e) => handleInputChange('videos_per_month', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posters_per_month">Posters/Month</Label>
                      <Input
                        id="posters_per_month"
                        type="number"
                        min="0"
                        value={formData.posters_per_month}
                        onChange={(e) => handleInputChange('posters_per_month', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reels_per_month">Reels/Month</Label>
                      <Input
                        id="reels_per_month"
                        type="number"
                        min="0"
                        value={formData.reels_per_month}
                        onChange={(e) => handleInputChange('reels_per_month', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stories_per_month">Stories/Month</Label>
                      <Input
                        id="stories_per_month"
                        type="number"
                        min="0"
                        value={formData.stories_per_month}
                        onChange={(e) => handleInputChange('stories_per_month', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="onboarding_date">Onboarding Date</Label>
                      <Input
                        id="onboarding_date"
                        type="date"
                        value={formData.onboarding_date}
                        onChange={(e) => handleInputChange('onboarding_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_start_date">Contract Start</Label>
                      <Input
                        id="contract_start_date"
                        type="date"
                        value={formData.contract_start_date}
                        onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_end_date">Contract End</Label>
                      <Input
                        id="contract_end_date"
                        type="date"
                        value={formData.contract_end_date}
                        onChange={(e) => handleInputChange('contract_end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Billing cycle, payment dates, and financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Payment Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Basic Payment Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment_cycle">Payment Cycle *</Label>
                        <Select
                          value={formData.payment_cycle}
                          onValueChange={(value) => handleInputChange('payment_cycle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentCycles.map((cycle) => (
                              <SelectItem key={cycle.value} value={cycle.value}>
                                {cycle.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {getPaymentCycleDescription()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_date">Payment Date *</Label>
                        <Select
                          value={formData.payment_date.toString()}
                          onValueChange={(value) => handleInputChange('payment_date', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment date" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentDates.map((date) => (
                              <SelectItem key={date.value} value={date.value}>
                                {date.label} of the month
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Day of month when payment is due
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_month_payment_status">Current Payment Status</Label>
                        <Select
                          value={formData.current_month_payment_status}
                          onValueChange={(value) => handleInputChange('current_month_payment_status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="monthly_retainer">Monthly Retainer Fee</Label>
                        <Input
                          id="monthly_retainer"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.monthly_retainer}
                          onChange={(e) => handleInputChange('monthly_retainer', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Monthly service fee amount
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_timing">Payment Timing</Label>
                      <Select
                        value={formData.payment_timing}
                        onValueChange={(value) => handleInputChange('payment_timing', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment timing" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTimingOptions.map((timing) => (
                            <SelectItem key={timing.value} value={timing.value}>
                              {timing.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {getPaymentTimingDescription()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Early Payment Section */}
                  {mode === 'edit' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Early Payment Management</h4>
                        <Button
                          type="button"
                          variant={showEarlyPaymentSection ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => setShowEarlyPaymentSection(!showEarlyPaymentSection)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {showEarlyPaymentSection ? 'Hide' : 'Record Early Payment'}
                        </Button>
                      </div>

                      {showEarlyPaymentSection && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-6 space-y-4">
                            {isEarlyPaymentEligible() ? (
                              <>
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Record an early payment for this client</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="early_payment_date">Early Payment Date</Label>
                                    <Input
                                      id="early_payment_date"
                                      type="date"
                                      value={formData.early_payment_date}
                                      onChange={(e) => handleInputChange('early_payment_date', e.target.value)}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="early_payment_amount">Early Payment Amount</Label>
                                    <Input
                                      id="early_payment_amount"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      value={formData.early_payment_amount}
                                      onChange={(e) => handleInputChange('early_payment_amount', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="early_payment_notes">Early Payment Notes</Label>
                                  <Textarea
                                    id="early_payment_notes"
                                    placeholder="Add any notes about this early payment..."
                                    rows={2}
                                    value={formData.early_payment_notes}
                                    onChange={(e) => handleInputChange('early_payment_notes', e.target.value)}
                                  />
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    type="button"
                                    onClick={handleMarkEarlyPayment}
                                    disabled={loading}
                                    className="flex-1"
                                  >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Mark as Early Paid
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {clientToEdit?.current_month_payment_status === 'paid' || 
                                   clientToEdit?.current_month_payment_status === 'early_paid'
                                    ? 'Payment has already been marked as paid for this month.'
                                    : 'Client payment status cannot be updated to early paid.'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Payment Timeline Information */}
                      {clientToEdit && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Next Payment:</span>
                              <span>{clientToEdit.next_payment_date ? new Date(clientToEdit.next_payment_date).toLocaleDateString() : 'Not set'}</span>
                            </div>
                            {clientToEdit.last_payment_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Last Payment:</span>
                                <span>{new Date(clientToEdit.last_payment_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {clientToEdit.early_payment_date && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Early Payment:</span>
                                <span>{new Date(clientToEdit.early_payment_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {clientToEdit.is_early_payment && clientToEdit.early_payment_days && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Days Early:</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {clientToEdit.early_payment_days} days
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              {/* ... Business & Location Tab (unchanged) ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Business & Location Information</CardTitle>
                  <CardDescription>Company location and business registration details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="Complete business address..."
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        placeholder="Postal Code"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_registration_number">Business Registration #</Label>
                      <Input
                        id="business_registration_number"
                        placeholder="Registration number"
                        value={formData.business_registration_number}
                        onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        placeholder="Tax identification number"
                        value={formData.tax_id}
                        onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
              <div className="flex-1 text-sm text-muted-foreground">
                {activeTab !== 'business' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      const tabs = ['basic', 'contact', 'social', 'content', 'payment', 'business'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next: { 
                      activeTab === 'basic' ? 'Contact' :
                      activeTab === 'contact' ? 'Social' :
                      activeTab === 'social' ? 'Content' :
                      activeTab === 'content' ? 'Payment' : 'Business'
                    }
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {mode === 'add' ? 'Create Client' : 'Update Client'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;