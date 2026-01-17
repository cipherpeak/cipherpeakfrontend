
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CalendarCheck, Banknote, Award, Briefcase } from 'lucide-react';

// Mock Data
const employeeDetails = {
  1: { name: 'Alice Wonderland', role: 'Frontend Dev', department: 'Engineering', month: 'January 2026' },
  2: { name: 'Charlie Brown', role: 'Project Manager', department: 'Management', month: 'January 2026' },
};

const attendanceData = {
  present: 22,
  leaves: 2,
  totalDays: 24, // Assuming 6-day work week or similar
};

const financialData = {
  salary: 50000,
  incentives: [
    { id: 1, description: 'Project Completion Bonus', amount: 5000, date: '2026-01-28' },
    { id: 2, description: 'Performance Bonus', amount: 2000, date: '2026-01-15' },
  ],
};

const taskLog = [
  { id: 1, task: 'Implement Login Flow', status: 'Completed', completionDate: '2026-01-10', priority: 'High' },
  { id: 2, task: 'Design Dashboard UI', status: 'Completed', completionDate: '2026-01-15', priority: 'Medium' },
  { id: 3, task: 'Fix Navigation Bug', status: 'Pending', completionDate: '-', priority: 'High' },
  { id: 4, task: 'API Integration', status: 'In Progress', completionDate: '-', priority: 'Medium' },
];

const EmployeeReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedMonth = location.state?.month || 'January 2026';

  // Safe cast for demo purposes
  const employeeId = Number(id) as keyof typeof employeeDetails;
  const employee = { ...employeeDetails[employeeId] || employeeDetails[1], month: selectedMonth };

  const totalIncentives = financialData.incentives.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{employee.name} - Monthly Report</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> {employee.role} | {employee.month}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.present}/{attendanceData.totalDays} Days</div>
            <p className="text-xs text-muted-foreground">Leaves Taken: {attendanceData.leaves}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salary Paid</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialData.salary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Base Salary</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incentives</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncentives.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Bonuses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Task Log</TabsTrigger>
          <TabsTrigger value="financials">Financial Details</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Task Performance</CardTitle>
              <CardDescription>Detailed log of tasks assigned and completed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskLog.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>
                        <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>{task.completionDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incentives Breakdown</CardTitle>
              <CardDescription>Details of additional earnings for the month.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.incentives.map((incentive) => (
                    <TableRow key={incentive.id}>
                      <TableCell className="font-medium">{incentive.description}</TableCell>
                      <TableCell>{incentive.date}</TableCell>
                      <TableCell className="text-right">₹{incentive.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total Incentives</TableCell>
                    <TableCell className="text-right font-bold">₹{totalIncentives.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeReportDetail;
