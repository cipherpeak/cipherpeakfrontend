import { useState } from 'react';
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
import { Plus, Search, MoreHorizontal, Mail, Phone, Building, MapPin, Edit, Trash2 } from 'lucide-react';
import AddClientModal from '@/components/modals/AddClientModal';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const clients = [
    {
      id: 1,
      name: 'ABC Corporation',
      contactPerson: 'Robert Johnson',
      email: 'robert.johnson@abccorp.com',
      phone: '+1 (555) 123-4567',
      industry: 'Technology',
      status: 'Active',
      location: 'New York, NY',
      projectsCount: 3,
      totalValue: '$125,000',
      avatar: '/placeholder-avatar.jpg',
      initials: 'AC',
    },
    {
      id: 2,
      name: 'XYZ Industries',
      contactPerson: 'Linda Martinez',
      email: 'linda.martinez@xyzind.com',
      phone: '+1 (555) 234-5678',
      industry: 'Manufacturing',
      status: 'Active',
      location: 'Chicago, IL',
      projectsCount: 2,
      totalValue: '$89,500',
      avatar: '/placeholder-avatar.jpg',
      initials: 'XI',
    },
    {
      id: 3,
      name: 'Global Solutions Ltd',
      contactPerson: 'Michael Chen',
      email: 'michael.chen@globalsol.com',
      phone: '+1 (555) 345-6789',
      industry: 'Consulting',
      status: 'Pending',
      location: 'San Francisco, CA',
      projectsCount: 1,
      totalValue: '$45,000',
      avatar: '/placeholder-avatar.jpg',
      initials: 'GS',
    },
    {
      id: 4,
      name: 'TechStart Inc',
      contactPerson: 'Emily Davis',
      email: 'emily.davis@techstart.com',
      phone: '+1 (555) 456-7890',
      industry: 'Software',
      status: 'Active',
      location: 'Austin, TX',
      projectsCount: 4,
      totalValue: '$200,000',
      avatar: '/placeholder-avatar.jpg',
      initials: 'TS',
    },
    {
      id: 5,
      name: 'Retail Masters',
      contactPerson: 'James Wilson',
      email: 'james.wilson@retailmasters.com',
      phone: '+1 (555) 567-8901',
      industry: 'Retail',
      status: 'On Hold',
      location: 'Miami, FL',
      projectsCount: 1,
      totalValue: '$35,000',
      avatar: '/placeholder-avatar.jpg',
      initials: 'RM',
    },
    {
      id: 6,
      name: 'Healthcare Plus',
      contactPerson: 'Dr. Sarah Thompson',
      email: 'sarah.thompson@healthplus.com',
      phone: '+1 (555) 678-9012',
      industry: 'Healthcare',
      status: 'Active',
      location: 'Boston, MA',
      projectsCount: 2,
      totalValue: '$150,000',
      avatar: '/placeholder-avatar.jpg',
      initials: 'HP',
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'on hold': return 'bg-muted text-muted-foreground';
      case 'inactive': return 'bg-danger text-danger-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIndustryColor = (industry: string) => {
    const colors = [
      'bg-primary text-primary-foreground',
      'bg-success text-success-foreground',
      'bg-warning text-warning-foreground',
      'bg-danger text-danger-foreground',
      'bg-muted text-muted-foreground',
    ];
    const hash = industry.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

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
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddClientModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients by name, contact, email, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {client.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.contactPerson}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Building className="mr-2 h-4 w-4" />
                      View Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-danger">
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
                  <span className="text-sm text-muted-foreground">Industry</span>
                  <Badge className={getIndustryColor(client.industry)}>
                    {client.industry}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="text-sm font-medium">{client.projectsCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="text-sm font-medium text-success">{client.totalValue}</span>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{client.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
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
    </div>

    <AddClientModal 
      open={isAddClientModalOpen} 
      onOpenChange={setIsAddClientModalOpen} 
    />
    </>
  );
};

export default Clients;