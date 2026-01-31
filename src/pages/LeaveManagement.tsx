// pages/LeaveManagement.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Loader2,
  User,
  FileText
} from 'lucide-react';
import ApplyLeaveModal from '@/components/modals/ApplyLeaveModal';
import LeaveDetailsModal from '@/components/modals/LeaveDetailsModal';
import { format } from 'date-fns';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';

// Types
interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeId: string;
  category: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  attachment?: string;
  reviewedBy?: string;
  reviewDate?: string;
  comments?: string;
}

const LeaveManagement = () => {
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'apply' | 'edit'>('apply');
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  // Robust admin check
  const isAdmin = user && (
    user.is_superuser ||
    (typeof user.role === 'string' && ['admin', 'hr', 'manager', 'director'].includes(user.role)) ||
    (typeof user === 'object' && 'role' in user && ['admin', 'hr', 'manager', 'director'].includes((user as any).role))
  );

  const fetchLeaves = async (statusFilter?: string) => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `${requests.LeaveList}?status=${statusFilter}`
        : requests.LeaveList;
      const response = await axiosInstance.get(url);
      const data = response.data;
      const leaves = Array.isArray(data) ? data : (data.results || data.data || []);

      const formattedLeaves: LeaveRequest[] = leaves.map((leave: any) => ({
        id: leave.id,
        employeeName: leave.employee_name || (leave.employee_details ? `${leave.employee_details.first_name} ${leave.employee_details.last_name}` : 'N/A'),
        employeeId: leave.employee_details?.employee_id || leave.employee_id?.toString() || 'N/A',
        category: leave.category || 'Annual Leave',
        fromDate: leave.start_date,
        toDate: leave.end_date,
        totalDays: leave.total_days || 0,
        reason: leave.reason || '',
        status: leave.status?.toLowerCase() || 'pending',
        appliedDate: leave.created_at || '',
        reviewedBy: leave.approved_by_name,
        reviewDate: leave.approved_at,
        comments: leave.remarks,
        attachment: leave.attachment
      }));

      setLeaveRequests(formattedLeaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leave requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      const response = await axiosInstance.get(requests.LeaveList);
      const data = response.data;
      const leaves = Array.isArray(data) ? data : (data.results || data.data || []);

      const formattedLeaves: LeaveRequest[] = leaves.map((leave: any) => ({
        id: leave.id,
        employeeName: leave.employee_name || (leave.employee_details ? `${leave.employee_details.first_name} ${leave.employee_details.last_name}` : 'N/A'),
        employeeId: leave.employee_details?.employee_id || leave.employee_id?.toString() || 'N/A',
        category: leave.category || 'Annual Leave',
        fromDate: leave.start_date,
        toDate: leave.end_date,
        totalDays: leave.total_days || 0,
        reason: leave.reason || '',
        status: leave.status?.toLowerCase() || 'pending',
        appliedDate: leave.created_at || '',
        reviewedBy: leave.approved_by_name,
        reviewDate: leave.approved_at,
        comments: leave.remarks,
        attachment: leave.attachment
      }));
      setAllLeaves(formattedLeaves);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    await fetchStatsData();
    if (activeTab === 'my-leaves') {
      fetchLeaves('pending');
    } else if (activeTab === 'history') {
      fetchLeaves('approved,rejected');
    } else {
      fetchLeaves();
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-leaves') {
      fetchLeaves('pending');
    } else if (activeTab === 'history') {
      fetchLeaves('approved,rejected');
    } else {
      fetchLeaves();
    }
  }, [activeTab]);

  const leaveBalances = [
    { category: 'Annual Leave', total: 18, used: allLeaves.filter(l => l.category === 'Annual Leave' && l.status === 'approved').reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0) },
    { category: 'Casual Leave', total: 12, used: allLeaves.filter(l => l.category === 'Casual Leave' && l.status === 'approved').reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0) },
    { category: 'Sick Leave', total: 6, used: allLeaves.filter(l => l.category === 'Sick Leave' && l.status === 'approved').reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0) },
    { category: 'LOP', total: 5, used: allLeaves.filter(l => l.category === 'LOP' && l.status === 'approved').reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0) },
    { category: 'Bereavement Leave', total: 3, used: allLeaves.filter(l => l.category === 'Bereavement Leave' && l.status === 'approved').reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0) },
  ].map(b => ({ ...b, remaining: Math.max(0, b.total - b.used) }));

  const upcomingLeaves = allLeaves.filter(
    leave => leave.status === 'approved' && new Date(leave.fromDate) > new Date()
  );

  const pendingCount = allLeaves.filter(l => l.status === 'pending').length;

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Annual Leave': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Sick Leave': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Maternity Leave': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Paternity Leave': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Emergency Leave': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const handleApplyNewLeave = () => {
    setModalMode('apply');
    setSelectedLeave(null);
    setIsApplyLeaveModalOpen(true);
  };

  const handleEditLeave = (leave: LeaveRequest) => {
    setModalMode('edit');
    setSelectedLeave(leave);
    setIsApplyLeaveModalOpen(true);
  };

  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteLeave = async (leave: LeaveRequest) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(requests.LeaveDetail(leave.id));
        toast({
          title: 'Success',
          description: 'Leave request deleted successfully',
        });
        handleRefresh();
      } catch (error: any) {
        console.error('Error deleting leave:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete leave request',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'N/A';
    }
  };

  const totalUsedLeaves = leaveBalances.reduce((sum, balance) => sum + (Number(balance.used) || 0), 0);
  const totalRemainingLeaves = leaveBalances.reduce((sum, balance) => sum + (Number(balance.remaining) || 0), 0);

  const LeaveTable = ({ requests, isAdmin, showActions }: { requests: LeaveRequest[], isAdmin: boolean, showActions: boolean }) => (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading leave requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground opacity-60">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p>No leave requests found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {isAdmin && <TableHead>Employee</TableHead>}
              <TableHead>Leave Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((leave) => (
              <TableRow key={leave.id} className="hover:bg-muted/30 transition-colors">
                {isAdmin && (
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{leave.employeeName}</span>
                      <span className="text-xs text-muted-foreground">{leave.employeeId}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal text-[10px]", getCategoryColor(leave.category))}>
                    {leave.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm whitespace-nowrap">
                      {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm">{leave.totalDays} days</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(leave.appliedDate)}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(leave.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(leave)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(isAdmin || leave.status === 'pending') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLeave(leave);
                        }}
                        className="h-8 w-8 p-0 hover:bg-muted"
                        title="Edit Request"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage employee leave requests and approvals' : 'Manage your leave requests, balances, and history'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={handleApplyNewLeave}>
            <Plus className="h-4 w-4" />
            Apply Leave
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary/80">Total Leave Balance</p>
                <p className="text-3xl font-bold tracking-tight">{totalRemainingLeaves} Days</p>
              </div>
              <CalendarDays className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-200/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600/80">Leaves Used</p>
                <p className="text-3xl font-bold tracking-tight text-green-700 dark:text-green-300">{Math.round(totalUsedLeaves)} Days</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-200/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600/80">Pending Requests</p>
                <p className="text-3xl font-bold tracking-tight text-yellow-700 dark:text-green-300">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600/80">Upcoming Leaves</p>
                <p className="text-3xl font-bold tracking-tight text-purple-700 dark:text-green-300">{upcomingLeaves.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
          <TabsTrigger value="my-leaves" className="flex items-center gap-2 py-3">
            <Clock className="h-4 w-4" />
            <span>{isAdmin ? 'Pending Reviews' : 'Pending Approvals'}</span>
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span>Policy and Balances</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-3">
            <CheckCircle className="h-4 w-4" />
            <span>Leave History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-leaves" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{isAdmin ? 'Pending Request Reviews' : 'My Pending Requests'}</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <LeaveTable requests={leaveRequests} isAdmin={!!isAdmin} showActions={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-fit">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  CipherPeak HR Leave Policy
                </h2>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    This document defines the official leave policy applicable to all employees of CipherPeak.
                    The policy is designed to support work-life balance while ensuring smooth business operations.
                  </p>

                  <div className="space-y-3">
                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">1. Casual Leave (CL)</h3>
                      <p>Total: 12 days per calendar year (1 day/month). Used for personal work, emergencies, or short-term needs. No carry-forward.</p>
                    </div>

                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">2. Sick Leave (SL)</h3>
                      <p>Total: 6 days per year. Used for illness or medical reasons. Medical proof may be required for continuous leave.</p>
                    </div>

                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">3. Annual Leave</h3>
                      <p>Total: 18 days per year. Credited on Jan 1st. Requires 3 days advance notice. Unused leave beyond 16 days is forfeited.</p>
                    </div>

                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">4. Leave Without Pay (LOP)</h3>
                      <p>Maximum: 5 days per year when paid leave is exhausted. Subject to salary deduction.</p>
                    </div>

                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">5. Bereavement Leave</h3>
                      <p>Paid leave for immediate family members, duration as approved by management.</p>
                    </div>

                    <div className="border-l-2 border-primary/20 pl-4">
                      <h3 className="font-semibold text-foreground">6. Company Holidays</h3>
                      <p>Total: 11 days per year (7 National, 4 Festival). Holiday list is published annually.</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Total Paid Leaves: 29 days per year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Current Leave Balances</h2>
                  <div className="space-y-6">
                    {leaveBalances.map((balance, index) => {
                      const percentage = (balance.used / balance.total) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{balance.category}</span>
                            <span className="text-sm text-muted-foreground">{balance.remaining} of {balance.total} days remaining</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-yellow-500" : "bg-primary"
                              )}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold">General Guidelines</h4>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc ml-4">
                        <li>Submit all requests through this portal</li>
                        <li>Inform manager in advance whenever possible</li>
                        <li>Management reserves the right to approve/reject based on needs</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold">{isAdmin ? 'All Leave History' : 'My Leave History'}</h2>
          <Card>
            <CardContent className="p-0">
              <LeaveTable requests={leaveRequests} isAdmin={!!isAdmin} showActions={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApplyLeaveModal
        open={isApplyLeaveModalOpen}
        onOpenChange={setIsApplyLeaveModalOpen}
        onSuccess={handleRefresh}
        mode={modalMode}
        leaveToEdit={selectedLeave}
      />

      <LeaveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        leave={selectedLeave}
        isAdmin={!!isAdmin}
        onStatusUpdate={handleRefresh}
      />
    </div>
  );
};

export default LeaveManagement;