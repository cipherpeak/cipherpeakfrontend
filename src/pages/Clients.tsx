import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Loader2,
  Building,
  MapPin,
  DollarSign,
  FileText,
  Image,
  Download,
  Eye,
  IndianRupee,
  Users,
  Calendar,
  Globe,
  Contact,
  ArrowLeft,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import AddClientModal from '@/components/modals/AddClientModal';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';

interface Client {
  id: number;
  client_name: string;
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
  // New Payment Fields
  payment_cycle: string;
  payment_date: number;
  next_payment_date?: string;
  current_month_payment_status: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
  // Computed Properties
  total_content_per_month?: number;
  is_active_client?: boolean;
  contract_duration?: number;
  is_payment_overdue?: boolean;
  days_until_next_payment?: number;
  payment_status_display?: string;
}

interface ClientDocument {
  id: number;
  client: number;
  document_type: string;
  title: string;
  description: string;
  file: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: number;
}

interface ClientDetails extends Client {
  documents: ClientDocument[];
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(requests.FetchClients);
      setClients(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.error || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch client details
  const fetchClientDetails = async (clientId: number) => {
    try {
      setDetailLoading(true);
      const response = await axiosInstance.get(`${requests.FetchClients}${clientId}/`);
      
      const clientDetails: ClientDetails = {
        ...response.data,
        documents: response.data.documents || []
      };
      
      setSelectedClient(clientDetails);
      setActiveTab('details');
    } catch (err: any) {
      console.error('Error fetching client details:', err);
      alert('Failed to load client details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Mark payment as paid
  const handleMarkPaymentPaid = async (clientId: number) => {
    try {
      await axiosInstance.post(`${requests.FetchClients}${clientId}/mark-paid/`);
      fetchClients(); // Refresh the list
      if (selectedClient?.id === clientId) {
        fetchClientDetails(clientId); // Refresh details if viewing this client
      }
    } catch (err: any) {
      console.error('Error marking payment as paid:', err);
      alert('Failed to mark payment as paid');
    }
  };

  const handleViewDetails = (client: Client) => {
    fetchClientDetails(client.id);
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedClient(null);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setModalMode('edit');
    setIsAddClientModalOpen(true);
  };

  const handleAddClient = () => {
    setClientToEdit(null);
    setModalMode('add');
    setIsAddClientModalOpen(true);
  };

  const handleClientUpdated = () => {
    fetchClients();
    if (selectedClient && clientToEdit && selectedClient.id === clientToEdit.id) {
      fetchClientDetails(clientToEdit.id);
    }
  };

  const handleModalClose = () => {
    setIsAddClientModalOpen(false);
    setClientToEdit(null);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      // await axiosInstance.delete(`${requests.DeleteClient}${clientId}/`);
      setClients(prev => prev.filter(client => client.id !== clientId));
      if (selectedClient?.id === clientId) {
        handleBackToList();
      }
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client');
    }
  };

  const handleClientAdded = () => {
    fetchClients();
    setIsAddClientModalOpen(false);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchClients();
  }, []);

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

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-4">Error: {error}</div>
          <Button onClick={fetchClients}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client relationships and projects
            </p>
          </div>
          {activeTab === 'list' && (
            <Button 
              className="flex items-center gap-2"
              onClick={handleAddClient}
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          )}
          {activeTab === 'details' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => selectedClient && handleEditClient(selectedClient)}
              >
                <Edit className="h-4 w-4" />
                Edit Client
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Client List View */}
          <TabsContent value="list" className="space-y-6 mt-0">
            {/* Search and Filters */}
            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search clients by name, contact, email, industry, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredClients.length} clients
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredClients.map((client) => (
                <Card key={client.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                            {getInitials(client.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {client.client_name || 'Unnamed Client'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Contact className="h-3 w-3" />
                            {getContactPerson(client)}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {client.current_month_payment_status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkPaymentPaid(client.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          Industry
                        </span>
                        <Badge variant="outline" className={getIndustryColor(client.industry)}>
                          {client.industry || 'Not specified'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className={getStatusColor(client.status)}>
                          {formatStatus(client.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Payment
                        </span>
                        <Badge variant="outline" className={getPaymentStatusColor(client.current_month_payment_status)}>
                          {formatStatus(client.current_month_payment_status)}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Content/Month
                        </span>
                        <span className="text-sm font-medium">{getTotalContent(client)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          Monthly Retainer
                        </span>
                        <span className="text-sm font-medium text-success">
                          {client.monthly_retainer ? `₹${client.monthly_retainer}` : 'Not set'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Next Payment
                        </span>
                        <span className="text-sm font-medium">
                          {client.next_payment_date ? formatDate(client.next_payment_date) : 'Not set'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        {client.contact_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{client.contact_email}</span>
                          </div>
                        )}
                        {client.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{client.contact_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{getLocation(client)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty States */}
            {filteredClients.length === 0 && clients.length > 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No clients found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {clients.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No clients yet</p>
                    <p className="text-sm mb-4">Get started by adding your first client</p>
                    <Button onClick={handleAddClient}>
                      Add Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Client Detail View */}
          <TabsContent value="details" className="mt-0">
            {detailLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading client details...</p>
                </div>
              </div>
            ) : selectedClient ? (
              <div className="space-y-6">
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
                              <p className="font-medium text-2xl text-success mt-1">
                                {selectedClient.monthly_retainer ? `$${selectedClient.monthly_retainer}` : 'Not set'}
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
                  <TabsContent value="payment" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Payment Cycle</span>
                              <span className="font-medium">{getPaymentCycleDisplay(selectedClient.payment_cycle)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Payment Date</span>
                              <span className="font-medium">{getPaymentDateDisplay(selectedClient.payment_date)} of month</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Current Status</span>
                              <Badge className={getPaymentStatusColor(selectedClient.current_month_payment_status)}>
                                {formatStatus(selectedClient.current_month_payment_status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Next Payment Date</span>
                              <span className="font-medium">
                                {selectedClient.next_payment_date ? formatDate(selectedClient.next_payment_date) : 'Not set'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Last Payment Date</span>
                              <span className="font-medium">
                                {selectedClient.last_payment_date ? formatDate(selectedClient.last_payment_date) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="text-sm text-muted-foreground">Monthly Retainer</span>
                              <span className="font-medium text-success">
                                {selectedClient.monthly_retainer ? `$${selectedClient.monthly_retainer}` : 'Not set'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedClient.current_month_payment_status === 'pending' && (
                          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="font-medium text-yellow-800">Payment Pending</p>
                                <p className="text-sm text-yellow-700">
                                  This client's payment for the current month is pending.
                                  {selectedClient.next_payment_date && (
                                    <> Next payment is due on {formatDate(selectedClient.next_payment_date)}.</>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button 
                              className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                              onClick={() => handleMarkPaymentPaid(selectedClient.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </Button>
                          </div>
                        )}

                        {selectedClient.current_month_payment_status === 'overdue' && (
                          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-red-800">Payment Overdue</p>
                                <p className="text-sm text-red-700">
                                  This client's payment is overdue. Please follow up immediately.
                                </p>
                              </div>
                            </div>
                            <Button 
                              className="mt-3 bg-red-600 hover:bg-red-700"
                              onClick={() => handleMarkPaymentPaid(selectedClient.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </Button>
                          </div>
                        )}

                        {selectedClient.current_month_payment_status === 'paid' && (
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800">Payment Received</p>
                                <p className="text-sm text-green-700">
                                  Payment for the current month has been received.
                                  {selectedClient.last_payment_date && (
                                    <> Last payment was on {formatDate(selectedClient.last_payment_date)}.</>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6 mt-6">
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
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documents ({selectedClient.documents?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedClient.documents && selectedClient.documents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedClient.documents.map((doc) => (
                              <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{doc.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {doc.document_type} • {formatDate(doc.uploaded_at)}
                                      </p>
                                      {doc.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                          {doc.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadFile(doc.file, doc.title)}
                                      className="flex items-center gap-2"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No documents available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No client data available</p>
                  <Button onClick={handleBackToList} className="mt-4">
                    Back to Client List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Client Modal */}
      <AddClientModal 
        open={isAddClientModalOpen} 
        onOpenChange={handleModalClose}
        onClientAdded={handleClientAdded}
        onClientUpdated={handleClientUpdated}
        clientToEdit={clientToEdit}
        mode={modalMode}
      />
    </>
  );
};

export default Clients;