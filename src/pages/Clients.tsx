import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  FileText,
  Eye,
  IndianRupee,
  Contact,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import AddClientModal from '@/components/modals/AddClientModal';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';
import ClientDetails from '@/components/pagesComponent/ClientCom/ClientDetails';

interface Client {
  id: number;
  client_name: string;
  client_type: string;
  industry: string;
  status: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
  monthly_retainer: string;
  videos_per_month: number;
  posters_per_month: number;
  reels_per_month: number;
  stories_per_month: number;
  onboarding_date: string;
  payment_cycle: string;
  payment_date: number;
  current_month_payment_status: string;
  created_at?: string;
  updated_at?: string;
  next_payment_date?: string;
  city?: string;
  state?: string;
  country?: string;
  owner_name?: string;
}

interface ClientDetailsType extends Client {
  documents: any[];
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDetailsType | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(requests.ClientList);
      console.log("Raw Client API Response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setClients(data);
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.results)) {
          setClients(data.results);
        } else if (Array.isArray(data.data)) {
          setClients(data.data);
        } else if (Array.isArray(data.clients)) {
          setClients(data.clients);
        } else {
          // Fallback
          const arrayValue = Object.values(data).find(val => Array.isArray(val));
          if (arrayValue) {
            console.log("Found array in response property, utilizing it.");
            setClients(arrayValue as Client[]);
          } else {
            console.error('Unexpected API response structure:', data);
            setClients([]);
          }
        }
      } else {
        console.error('API response is not an array or object:', typeof data);
        setClients([]);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients');
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch client details
  const fetchClientDetails = async (clientId: number) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(requests.ClientDetail(clientId));
      setSelectedClient(response.data);
      setActiveTab('details');
    } catch (err) {
      console.error('Error fetching client details:', err);
      toast.error('Failed to load client details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Mark payment as paid
  const handleMarkPaymentPaid = async (clientId: number) => {
    try {
      await axiosInstance.post(requests.ClientPaymentProcess(clientId));
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, current_month_payment_status: 'paid' } : c));
      toast.success('Payment marked as paid');
    } catch (err: any) {
      console.error('Error marking payment as paid:', err);
      toast.error('Failed to mark payment as paid');
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
    if (selectedClient) {
      fetchClientDetails(selectedClient.id);
    }
    setIsAddClientModalOpen(false);
    toast.success('Client updated successfully');
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
      await axiosInstance.delete(requests.ClientDelete(clientId));
      toast.success('Client deleted successfully');
      fetchClients();
      if (selectedClient?.id === clientId) {
        handleBackToList();
      }
    } catch (err: any) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client');
    }
  };

  const handleClientAdded = () => {
    fetchClients();
    setIsAddClientModalOpen(false);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    console.log(fileUrl);
    console.log(fileName);


    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // const getPaymentStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'paid': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
  //     case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
  //     case 'overdue': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
  //     case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  //   }
  // };
  const getPaymentStatusColor = (status?: string) => {
    if (!status) return "bg-gray-400 text-white";

    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500 text-white";
      case "early paid":
        return "bg-emerald-500 text-white";
      case "overdue":
        return "bg-red-500 text-white";
      case "due today":
        return "bg-orange-500 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-400 text-white";
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
                        <span className="text-sm font-medium text-green-600">
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

          {/* Client Details View */}
          <TabsContent value="details" className="mt-0">
            <ClientDetails
              selectedClient={selectedClient}
              detailLoading={detailLoading}
              onBackToList={handleBackToList}
              onEditClient={handleEditClient}
              onMarkPaymentPaid={handleMarkPaymentPaid}
              onDownloadFile={handleDownloadFile}
              onRefresh={() => selectedClient && fetchClientDetails(selectedClient.id)}
            />
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
