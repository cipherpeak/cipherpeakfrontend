// pages/LeaveManagement.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import ApplyLeaveModal from '@/components/modals/ApplyLeaveModal';
import { format } from 'date-fns';
import { requests } from '@/lib/urls';
import axiosInstance from '@/axios/axios';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

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

interface LeaveBalance {
  category: string;
  total: number;
  used: number;
  remaining: number;
}

const LeaveManagement = () => {
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'apply' | 'edit'>('apply');
  const { toast } = useToast();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(requests.LeaveList);
      const data = response.data;
      console.log("DEBUG: Raw Leave API Response:", data);

      const leaves = Array.isArray(data) ? data : (data.results || data.data || []);

      const formattedLeaves: LeaveRequest[] = leaves.map((leave: any) => ({
        id: leave.id,
        employeeName: leave.employee_details ? `${leave.employee_details.first_name} ${leave.employee_details.last_name}` : 'N/A',
        employeeId: leave.employee_details?.id?.toString() || 'N/A',
        category: leave.category || 'Annual Leave',
        fromDate: leave.start_date,
        toDate: leave.end_date,
        totalDays: leave.total_days || 0,
        reason: leave.reason || '',
        status: leave.status?.toLowerCase() || 'pending',
        appliedDate: leave.applied_on || leave.created_at || '',
        reviewedBy: leave.approved_by_details ? `${leave.approved_by_details.first_name} ${leave.approved_by_details.last_name}` : undefined,
        reviewDate: leave.reviewed_at,
        comments: leave.comments
      }));

      console.log("DEBUG: Formatted Leaves Count:", formattedLeaves.length);
      console.log("DEBUG: First Formatted Leave:", formattedLeaves[0]);
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

  useEffect(() => {
    fetchLeaves();
  }, []);

  const leaveBalances = [
    { category: 'Annual Leave', total: 20, used: leaveRequests.filter(l => l.category === 'Annual Leave' && l.status === 'approved').reduce((sum, l) => sum + l.totalDays, 0) },
    { category: 'Sick Leave', total: 15, used: leaveRequests.filter(l => l.category === 'Sick Leave' && l.status === 'approved').reduce((sum, l) => sum + l.totalDays, 0) },
    { category: 'Maternity Leave', total: 180, used: leaveRequests.filter(l => l.category === 'Maternity Leave' && l.status === 'approved').reduce((sum, l) => sum + l.totalDays, 0) },
    { category: 'Paternity Leave', total: 15, used: leaveRequests.filter(l => l.category === 'Paternity Leave' && l.status === 'approved').reduce((sum, l) => sum + l.totalDays, 0) },
    { category: 'Emergency Leave', total: 5, used: leaveRequests.filter(l => l.category === 'Emergency Leave' && l.status === 'approved').reduce((sum, l) => sum + l.totalDays, 0) },
  ].map(b => ({ ...b, remaining: Math.max(0, b.total - b.used) }));

  const upcomingLeaves = leaveRequests.filter(
    leave => leave.status === 'approved' && new Date(leave.fromDate) > new Date()
  );

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
      'Study Leave': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Bereavement Leave': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'Unpaid Leave': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const handleApplyLeave = (leaveData: any) => {
    console.log('Leave requested from modal:', leaveData);
  };

  const handleViewLeave = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    // You could open a modal to view leave details here
  };

  const handleEditLeave = (leave: LeaveRequest) => {
    setModalMode('edit');
    setSelectedLeave(leave);
    setIsApplyLeaveModalOpen(true);
  };

  const handleApplyNewLeave = () => {
    setModalMode('apply');
    setSelectedLeave(null);
    setIsApplyLeaveModalOpen(true);
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
        fetchLeaves(); // Refresh the list
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
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const totalUsedLeaves = leaveBalances.reduce((sum, balance) => sum + balance.used, 0);
  const totalRemainingLeaves = leaveBalances.reduce((sum, balance) => sum + balance.remaining, 0);
  const totalLeaves = leaveBalances.reduce((sum, balance) => sum + balance.total, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your leave requests, balances, and history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {/* Handle export */ }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2"
            onClick={handleApplyNewLeave}
          >
            <Plus className="h-4 w-4" />
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Leave Balance</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalRemainingLeaves} Days</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Leaves Used</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalUsedLeaves} Days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {leaveRequests.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Upcoming Leaves</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{upcomingLeaves.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="my-leaves" className="flex items-center gap-2 py-3">
            <Calendar className="h-4 w-4" />
            <span>My Leaves</span>
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span>Leave Balances</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 py-3">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-3">
            <Eye className="h-4 w-4" />
            <span>Leave History</span>
          </TabsTrigger>
        </TabsList>

        {/* My Leaves Tab */}
        <TabsContent value="my-leaves" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">My Leave Requests</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading leave requests...</span>
                  </div>
                ) : leaveRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                    <p>No leave requests found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <Badge variant="outline" className={getCategoryColor(leave.category)}>
                              {leave.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{leave.totalDays} days</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(leave.appliedDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(leave.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLeave(leave)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {leave.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLeave(leave)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLeave(leave)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Leaves */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Approved Leaves</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLeaves.map((leave) => (
                <Card key={`upcoming-${leave.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className={getCategoryColor(leave.category)}>
                          {leave.category}
                        </Badge>
                        <p className="font-medium mt-2">{leave.totalDays} days</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm mt-3 line-clamp-2">{leave.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold">Leave Balance Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Details</CardTitle>
                <CardDescription>
                  Breakdown of your available leave balances by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveBalances.map((balance, index) => {
                    const percentage = (balance.used / balance.total) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{balance.category}</span>
                          <span className="text-sm font-medium">
                            {balance.remaining} of {balance.total} days remaining
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Used: {balance.used} days</span>
                          <span>Available: {balance.remaining} days</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Summary</CardTitle>
                <CardDescription>
                  Quick overview of your leave utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Leave Days</p>
                      <p className="text-2xl font-bold">{totalLeaves}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Days Used</p>
                      <p className="text-2xl font-bold text-green-600">{totalUsedLeaves}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className="text-2xl font-bold text-blue-600">{totalRemainingLeaves}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Utilization Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {((totalUsedLeaves / totalLeaves) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Leave Policy Highlights</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Leave requests should be submitted at least 3 days in advance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Annual leaves can be carried forward up to 5 days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Sick leaves require medical certificate for more than 3 days</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold">Leave Calendar</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're working on an interactive calendar view for your leaves.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    In the meantime, you can view your leaves in the table view.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold">Leave History</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leave) => (
                      <TableRow key={`history-${leave.id}`}>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(leave.category)}>
                            {leave.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </TableCell>
                        <TableCell>{leave.totalDays} days</TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell>
                          {leave.reviewedBy || (
                            <span className="text-muted-foreground">Not reviewed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {leave.reviewDate ? formatDate(leave.reviewDate) : '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate" title={leave.comments}>
                            {leave.comments || '-'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        open={isApplyLeaveModalOpen}
        onOpenChange={setIsApplyLeaveModalOpen}
        onApplyLeave={handleApplyLeave}
        onSuccess={fetchLeaves}
        mode={modalMode}
        leaveToEdit={selectedLeave}
      />
    </div >
  );
};

export default LeaveManagement;