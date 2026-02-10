import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CalendarCheck, Banknote, Award, Briefcase, FileText, Clock, Loader2 } from 'lucide-react';
import { exportDetailedReportToPDF } from '@/lib/pdfExport';
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import { toast } from 'sonner';

const EmployeeReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [leavesData, setLeavesData] = useState<any[]>([]);

  // Get month and year from location state or use current
  const now = new Date();
  const selectedMonth = location.state?.month || now.getMonth() + 1;
  const selectedYear = location.state?.year || now.getFullYear();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEmployeeReport();
  }, [id, selectedMonth, selectedYear]);

  const fetchEmployeeReport = async () => {
    setLoading(true);
    try {
      const params = { month: selectedMonth, year: selectedYear };
      const response = await axiosInstance.get(requests.MonthlyEmployeeReport, { params });
      const data = response.data.details || [];
      const leaves = response.data.leaves?.details || [];

      console.log('=== EMPLOYEE REPORT DEBUG ===');
      console.log('Full API Response:', response.data);
      console.log('Employee Details Array:', data);
      console.log('Looking for employee ID:', id);

      // Find the specific employee by ID
      const employee = data.find((emp: any) => emp.id === Number(id));

      console.log('Found Employee:', employee);
      console.log('Base Salary Value:', employee?.base_salary);
      console.log('Employee Data Keys:', employee ? Object.keys(employee) : 'No employee found');

      if (employee) {
        setEmployeeData(employee);
        setLeavesData(leaves.filter((leave: any) =>
          leave.employee_id === Number(id) || leave.employee_name === employee.employee_name
        ));
      } else {
        toast.error('Employee report not found for this period');
        setEmployeeData(null);
      }
    } catch (error) {
      console.error('Failed to fetch employee report:', error);
      toast.error('Failed to load employee report');
      setEmployeeData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employee report...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No report data found for this employee in {months[selectedMonth - 1]} {selectedYear}</p>
            <Button onClick={() => navigate('/reports')} className="mt-4">
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalIncentives = employeeData.incentives || 0;
  const attendanceData = {
    present: employeeData.attendance_days || 0,
    leaves: employeeData.leaves_count || 0,
    totalDays: (employeeData.attendance_days || 0) + (employeeData.leaves_count || 0),
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{employeeData.employee_name} - Monthly Report</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> {employeeData.designation || employeeData.role || 'Employee'} | {months[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <Button
          onClick={() => {
            const taskData = employeeData.tasks_log || [];
            const leaveDetails = leavesData.map(leave => ({
              type: leave.leave_type || 'Leave',
              duration: `${leave.total_days || 0} Days`,
              status: leave.status || 'N/A',
              reason: leave.reason || 'N/A'
            }));

            exportDetailedReportToPDF(
              [
                {
                  title: 'Monthly Task Performance',
                  data: taskData.length > 0 ? taskData : [{ task: 'No tasks recorded', status: 'N/A', completionDate: 'N/A', priority: 'N/A' }],
                  columns: ['task', 'priority', 'status', 'completionDate']
                },
                {
                  title: 'Financial Breakdown',
                  data: [{
                    description: 'Base Salary',
                    amount: employeeData.base_salary || 0
                  }, {
                    description: 'Incentives',
                    amount: employeeData.incentives || 0
                  }, {
                    description: 'Deductions',
                    amount: -(employeeData.deductions || 0)
                  }, {
                    description: 'Net Paid',
                    amount: employeeData.net_paid || 0
                  }],
                  columns: ['description', 'amount']
                },
                {
                  title: 'Leave Details',
                  data: leaveDetails.length > 0 ? leaveDetails : [{ type: 'No leaves', duration: '0 Days', status: 'N/A', reason: 'N/A' }],
                  columns: ['type', 'duration', 'status', 'reason']
                }
              ],
              {
                filename: `Report_${employeeData.employee_name}_${months[selectedMonth - 1]}_${selectedYear}`,
                mainTitle: `${employeeData.employee_name} - Monthly Report`,
                subtitle: `${months[selectedMonth - 1]} ${selectedYear}`,
                orientation: 'portrait'
              }
            );
          }}
          className="gap-2"
          variant="default"
        >
          <FileText className="h-4 w-4" />
          PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Base Salary</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(employeeData.base_salary || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Base Pay</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaves</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.leaves} Days</div>
            <p className="text-xs text-muted-foreground">Total taken this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Task Log</TabsTrigger>
          <TabsTrigger value="financials">Financial Details</TabsTrigger>
          <TabsTrigger value="leaves">Leave Details</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Task Performance</CardTitle>
              <CardDescription>Detailed log of tasks assigned and completed.</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeData.tasks_log && employeeData.tasks_log.length > 0 ? (
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
                    {employeeData.tasks_log.map((task: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{task.task || task.title || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                            {task.priority || 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${task.status === 'Completed' || task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'In Progress' || task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {task.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell>{task.completionDate || task.completion_date || task.completed_at || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks recorded for this period</p>
                  <p className="text-sm mt-2">Tasks completed: {employeeData.tasks_completed || 0} | Pending: {employeeData.tasks_pending || 0}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
              <CardDescription>Details of salary components for the month.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Base Salary</TableCell>
                    <TableCell className="text-right">₹{(employeeData.base_salary || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Incentives / Bonuses</TableCell>
                    <TableCell className="text-right text-green-600">+₹{(employeeData.incentives || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Deductions</TableCell>
                    <TableCell className="text-right text-red-600">-₹{(employeeData.deductions || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Net Paid</TableCell>
                    <TableCell className="text-right font-bold">₹{(employeeData.net_paid || 0).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Details</CardTitle>
              <CardDescription>Records of leaves taken during this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leavesData.length > 0 ? (
                    leavesData.map((leave: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{leave.leave_type || 'Leave'}</TableCell>
                        <TableCell>{leave.total_days || 0} Days</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              leave.status?.toLowerCase() === 'approved' || leave.status_code === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : leave.status?.toLowerCase() === 'rejected' || leave.status_code === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {leave.status || leave.status_code || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{leave.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No leaves taken this month.
                      </TableCell>
                    </TableRow>
                  )}
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
