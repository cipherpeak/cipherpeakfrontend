
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Static Data
const clientData = [
  { id: 1, name: 'Acme Corp', contact: 'John Doe', email: 'john@acme.com', status: 'Active', project: 'Website Redesign' },
  { id: 2, name: 'Globex Inc', contact: 'Jane Smith', email: 'jane@globex.com', status: 'Active', project: 'Mobile App' },
  { id: 3, name: 'Soylent Corp', contact: 'Bob Johnson', email: 'bob@soylent.com', status: 'Inactive', project: 'SEO Optimization' },
  { id: 4, name: 'Initech', contact: 'Bill Lumbergh', email: 'bill@initech.com', status: 'Active', project: 'ERP Implementation' },
  { id: 5, name: 'Umbrella Corp', contact: 'Albert Wesker', email: 'albert@umbrella.com', status: 'Pending', project: 'Security Audit' },
];

const employeeData = [
  { id: 1, name: 'Alice Wonderland', role: 'Frontend Dev', department: 'Engineering', status: 'Active', joinDate: '2025-01-15' },
  { id: 2, name: 'Charlie Brown', role: 'Project Manager', department: 'Management', status: 'Active', joinDate: '2024-11-20' },
  { id: 3, name: 'Eve Hacker', role: 'Backend Dev', department: 'Engineering', status: 'On Leave', joinDate: '2025-03-01' },
  { id: 4, name: 'Mallory Malice', role: 'QA Engineer', department: 'QA', status: 'Active', joinDate: '2025-02-10' },
  { id: 5, name: 'Trent Trust', role: 'DevOps', department: 'Operations', status: 'Active', joinDate: '2024-12-05' },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedMonth, setSelectedMonth] = useState('January 2026');
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="January 2026">January 2026</SelectItem>
              <SelectItem value="February 2026">February 2026</SelectItem>
              <SelectItem value="March 2026">March 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="clients">Clients Report</TabsTrigger>
          <TabsTrigger value="employees">Employees Report</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Client Reports</CardTitle>
                <CardDescription>
                  Overview of all client projects and status for {selectedMonth}.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.project}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            client.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/reports/client/${client.id}`, { state: { month: selectedMonth } })}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Employee Reports</CardTitle>
                <CardDescription>
                  Detailed list of employee roles and status.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeData.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.joinDate}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {employee.status}
                        </span>
                      </TableCell>
                       <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/reports/employee/${employee.id}`, { state: { month: selectedMonth } })}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
