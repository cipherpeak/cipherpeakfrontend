import { useState, useEffect } from 'react';
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
import axiosInstance from '@/axios/axios';
import { requests } from '@/lib/urls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  IndianRupee,
  FileText,
  User,
  MapPin,
  BarChart3,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  Briefcase,
  Clock,
  CreditCard,
  CalendarCheck,
  Zap,
  MessageSquare,
  Layout,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF } from '@/lib/pdfExport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [isLoading, setIsLoading] = useState(false);
  const [clientData, setClientData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailTab, setDetailTab] = useState('personal');
  const [leavesData, setLeavesData] = useState<any[]>([]);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const navigate = useNavigate();

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: now.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = { month: selectedMonth, year: selectedYear };

      // Determine what data types need to be fetched
      const fetchClients = activeTab === 'clients' || (selectedReport && selectedReport.type === 'client');
      const fetchEmployees = activeTab === 'employees' || (selectedReport && selectedReport.type === 'employee');
      const fetchIncome = activeTab === 'income';
      const fetchExpense = activeTab === 'expense';

      if (fetchClients) {
        try {
          const response = await axiosInstance.get(requests.MonthlyClientReport, { params });
          const data = response.data.details || response.data || [];
          console.log('Client data fetched:', data.length);
          setClientData(data);
        } catch (err) {
          console.error('Failed to fetch client report:', err);
          toast.error('Failed to load client report');
        }
      }

      if (fetchEmployees) {
        try {
          const response = await axiosInstance.get(requests.MonthlyEmployeeReport, { params });
          const data = response.data.details || [];
          const leaves = response.data.leaves?.details || [];
          console.log('=== REPORTS PAGE - EMPLOYEE DATA DEBUG ===');
          console.log('Employee Data from API:', data);
          console.log('First Employee:', data[0]);
          console.log('First Employee Base Salary:', data[0]?.base_salary);
          console.log('Employee data fetched:', data.length);
          setEmployeeData(data);
          setLeavesData(leaves);
        } catch (err) {
          console.error('Failed to fetch employee report:', err);
          toast.error('Failed to load employee report');
        }
      }

      if (fetchIncome) {
        try {
          const response = await axiosInstance.get(requests.MonthlyIncomeReport, { params });
          setIncomeData(response.data.income?.details || []);
          setIncomeTotal(response.data.income?.total || 0);
        } catch (err) {
          console.error('Failed to fetch income report:', err);
        }
      }

      if (fetchExpense) {
        try {
          const response = await axiosInstance.get(requests.MonthlyExpenseReport, { params });
          setExpenseData(response.data.expense?.details || []);
          setExpenseTotal(response.data.expense?.total || 0);
        } catch (err) {
          console.error('Failed to fetch expense report:', err);
        }
      }
    } catch (error) {
      console.error('Unexpected error in report fetching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedReport) {
      let dataSet: any[] = [];
      if (selectedReport.type === 'client') dataSet = clientData;
      else if (selectedReport.type === 'employee') dataSet = employeeData;
      else if (selectedReport.type === 'income') dataSet = incomeData;
      else if (selectedReport.type === 'expense') dataSet = expenseData;

      const updated = dataSet.find(item => item.id === selectedReport.id);

      if (updated) {
        setSelectedReport({ ...updated, type: selectedReport.type, no_data: false });
      } else {
        // Only mark as no_data if we are not loading (avoid flicker)
        if (!isLoading) {
          setSelectedReport(prev => ({
            ...prev,
            base_salary: 0,
            monthly_retainer: 0,
            amount: 0,
            tax: 0,
            discount: 0,
            net_paid: 0,
            net_amount: 0,
            incentives: 0,
            deductions: 0,
            tasks_completed: 0,
            tasks_pending: 0,
            verified_count_videos: 0,
            verified_count_posters: 0,
            leaves_count: 0,
            content_requirements: {
              videos: { actual: 0, target: 0 },
              posters: { actual: 0, target: 0 },
              reels: { actual: 0, target: 0 },
              stories: { actual: 0, target: 0 }
            },
            payment_date: null,
            status: 'NO_DATA',
            remarks: '',
            no_data: true
          }));
        }
      }
    }
  }, [clientData, employeeData, incomeData, expenseData, isLoading]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Manage your business insights and performance</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              onClick={() => {
                const dataToExport = (activeTab === 'clients' ? clientData :
                  activeTab === 'employees' ? employeeData :
                    activeTab === 'income' ? incomeData : expenseData).map(row => {
                      const newRow = { ...row };
                      // Format content requirements if they exist
                      if (newRow.content_requirements) {
                        const reqs = newRow.content_requirements;
                        newRow.content_requirements = Object.entries(reqs)
                          .map(([key, val]: [string, any]) => `${key.charAt(0).toUpperCase()}:${val.actual || 0}/${val.target || 0}`)
                          .join(', ');
                      }
                      // Flatten employee details for PDF if they are missing at top level
                      if (activeTab === 'employees') {
                        newRow.email = newRow.email || newRow.employee_details?.email || newRow.employee_email;
                        newRow.gender = newRow.gender || newRow.employee_details?.gender || newRow.employee_gender;
                        newRow.phone = newRow.phone_number || newRow.employee_details?.phone_number || newRow.phone || newRow.employee_phone;
                      }
                      return newRow;
                    });

                exportToPDF(
                  dataToExport,
                  `Monthly_${activeTab}_Report`,
                  `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Monthly Report - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                );
              }}
              className="gap-2"
              variant="default"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>

          <Button onClick={fetchData} variant="outline" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "↻"}
          </Button>
        </div>
      </div>



      {selectedReport ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedReport(null)}
              className="gap-2 -ml-2 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>

            <div className="flex gap-1">
              <Button
                onClick={() => {
                  const cleanedReport = { ...selectedReport };
                  if (cleanedReport.content_requirements) {
                    const reqs = cleanedReport.content_requirements;
                    cleanedReport.content_requirements = Object.entries(reqs)
                      .map(([key, val]: [string, any]) => `${key.charAt(0).toUpperCase()}:${val.actual || 0}/${val.target || 0}`)
                      .join(', ');
                  }

                  const filename = ['income', 'expense'].includes(selectedReport.type)
                    ? `${selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}_${selectedReport.id || 'record'}`
                    : `Report_${selectedReport.client_name || selectedReport.employee_name || 'Details'}`;

                  const title = ['income', 'expense'].includes(selectedReport.type)
                    ? `${selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)} Report: ${selectedReport.type_display || selectedReport.type}`
                    : `${selectedReport.type === 'employee' ? 'Employee' : 'Client'} Report: ${selectedReport.employee_name || selectedReport.client_name}`;

                  exportToPDF([cleanedReport], filename, title);
                }}
                className="gap-2"
                variant="default"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">
              {selectedReport.type === 'employee' ? selectedReport.employee_name :
                selectedReport.type === 'client' ? selectedReport.client_name :
                  (selectedReport.type_display || selectedReport.type)}
            </h2>
            {selectedReport.no_data && (
              <Badge variant="destructive" className="font-black animate-pulse shadow-sm">
                {selectedReport.type === 'employee'
                  ? `SALARY NOT PROCESSED FOR ${months.find(m => m.value === selectedMonth)?.label?.toUpperCase()} ${selectedYear}`
                  : selectedReport.type === 'client'
                    ? `PAYMENT NOT PROCESSED FOR ${months.find(m => m.value === selectedMonth)?.label?.toUpperCase()} ${selectedYear}`
                    : `NO RECORD FOR ${months.find(m => m.value === selectedMonth)?.label?.toUpperCase()} ${selectedYear}`}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-1">
                      {selectedReport.type === 'employee' ? 'Base Salary' :
                        selectedReport.type === 'client' ? 'Monthly Retainer' : 'Amount'}
                    </p>
                    <h3 className="text-2xl font-bold text-emerald-900 tracking-tight">
                      ₹{(selectedReport.type === 'employee' ? selectedReport.base_salary :
                        selectedReport.type === 'client' ? selectedReport.monthly_retainer : selectedReport.amount)?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-xs text-emerald-600/70 mt-1">
                      {selectedReport.type === 'employee' ? (selectedReport.department || 'N/A') :
                        selectedReport.type === 'client' ? (selectedReport.payment_cycle || 'Monthly') :
                          (selectedReport.category || selectedReport.category_name || 'General')}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    {selectedReport.type === 'employee' ? <User className="h-5 w-5 text-emerald-600" /> :
                      ['income', 'expense'].includes(selectedReport.type) ? <DollarSign className="h-5 w-5 text-emerald-600" /> :
                        <TrendingUp className="h-5 w-5 text-emerald-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      {selectedReport.type === 'employee' ? 'Monthly Task Performance' :
                        selectedReport.type === 'client' ? 'Content Per Month' : 'Transaction Date'}
                    </p>
                    <h3 className="text-2xl font-bold text-blue-900 tracking-tight">
                      {selectedReport.type === 'employee'
                        ? (selectedReport.tasks_completed ?? selectedReport.completed_tasks ?? selectedReport.completed_count ?? selectedReport.tasks_done ?? 0)
                        : selectedReport.type === 'client'
                          ? Object.values(selectedReport.content_requirements || {}).reduce((acc: number, curr: any) => acc + (curr.target || 0), 0)
                          : selectedReport.date}
                    </h3>
                    <p className="text-xs text-blue-600/70 mt-1">
                      {selectedReport.type === 'employee'
                        ? `${selectedReport.tasks_completed || 0} Completed / ${selectedReport.tasks_pending || 0} Pending`
                        : selectedReport.type === 'client' ? 'Total monthly production goal' : 'Recorded transaction date'}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {selectedReport.type === 'employee' ? <CalendarCheck className="h-5 w-5 text-blue-600" /> :
                      ['income', 'expense'].includes(selectedReport.type) ? <Clock className="h-5 w-5 text-blue-600" /> :
                        <BarChart3 className="h-5 w-5 text-blue-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={selectedReport.status?.toLowerCase().includes('paid') ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Payment Status</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${selectedReport.status?.toLowerCase().includes('paid') ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {selectedReport.status?.toUpperCase() || 'UNKNOWN'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Status for {months.find(m => m.value === selectedMonth)?.label}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${selectedReport.status?.toLowerCase().includes('paid') ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <Wallet className={`h-5 w-5 ${selectedReport.status?.toLowerCase().includes('paid') ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {['employee', 'income', 'expense'].includes(selectedReport.type) && (
              <Card className={selectedReport.type === 'employee' ? "bg-purple-50/50 border-purple-100" : "bg-slate-50 border-slate-200"}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-medium mb-1 ${selectedReport.type === 'employee' ? 'text-purple-600' : 'text-slate-600'}`}>
                        {selectedReport.type === 'employee' ? 'Leave Overview' : 'Payment Channel'}
                      </p>
                      <h3 className={`text-2xl font-bold tracking-tight leading-none ${selectedReport.type === 'employee' ? 'text-purple-900' : 'text-slate-900'}`}>
                        {selectedReport.type === 'employee'
                          ? `${selectedReport.leaves_count || 0} ${selectedReport.leaves_count === 1 ? 'Day' : 'Days'}`
                          : selectedReport.payment_method?.replace('_', ' ').toUpperCase() || 'DIRECT TRANSFER'}
                      </h3>
                      {selectedReport.type === 'employee' ? (() => {
                        const pendingTotal = leavesData.filter(l =>
                          (l.employee_id === selectedReport.id || l.employee_name === selectedReport.employee_name) &&
                          l.status_code === 'pending'
                        ).reduce((acc, curr) => acc + (curr.total_days || 0), 0);

                        return pendingTotal > 0 ? (
                          <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                            <Clock className="h-3 w-3" /> {pendingTotal} {pendingTotal === 1 ? 'day' : 'days'} pending
                          </p>
                        ) : (
                          <p className="text-[10px] text-purple-600/70 font-semibold mt-1">Confirmed attendance impact</p>
                        );
                      })() : (
                        <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">Verified transaction method</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${selectedReport.type === 'employee' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                      {selectedReport.type === 'employee' ? <Clock className="h-5 w-5 text-purple-600" /> : <CreditCard className="h-5 w-5 text-slate-600" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-b pb-4">
            <Button
              variant={detailTab === 'personal' ? 'default' : 'outline'}
              onClick={() => setDetailTab('personal')}
              className="rounded-full px-6 font-semibold"
            >
              {selectedReport.type === 'employee' ? 'Employee Personal Details' :
                selectedReport.type === 'client' ? 'Client Personal Details' :
                  selectedReport.type === 'income' ? 'General Details' : 'General Details'}
            </Button>
            <Button
              variant={detailTab === 'payment' ? 'default' : 'outline'}
              onClick={() => setDetailTab('payment')}
              className="rounded-full px-6 font-semibold"
            >
              {selectedReport.type === 'employee' ? 'Salary Details' :
                selectedReport.type === 'client' ? 'Payment Details' : 'Transaction Details'}
            </Button>
            {selectedReport.type === 'employee' && (
              <Button
                variant={detailTab === 'leaves' ? 'default' : 'outline'}
                onClick={() => setDetailTab('leaves')}
                className="rounded-full px-6 font-semibold"
              >
                Leave Details
              </Button>
            )}
            {['employee', 'client'].includes(selectedReport.type) && (
              <Button
                variant={selectedReport.type === 'employee' ? (detailTab === 'tasks' ? 'default' : 'outline') : (detailTab === 'content' ? 'default' : 'outline')}
                onClick={() => setDetailTab(selectedReport.type === 'employee' ? 'tasks' : 'content')}
                className="rounded-full px-6 font-semibold"
              >
                {selectedReport.type === 'employee' ? 'Task Details' : 'Content Details'}
              </Button>
            )}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            {detailTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <Card className="border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm md:col-span-2 ring-1 ring-slate-200/50">
                  <CardHeader className="py-6 px-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-inner ring-1 ring-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight text-slate-800">
                        {selectedReport.type === 'employee' ? 'Employee Profile Summary' :
                          selectedReport.type === 'client' ? 'Client Profile Summary' :
                            selectedReport.type === 'income' ? 'Income Transaction Summary' : 'Expense Transaction Summary'}
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {['income', 'expense'].includes(selectedReport.type) ? 'Transaction & Entity Details' :
                          selectedReport.type === 'employee' ? 'Employment & Contact Info' : 'Business & Contact Credentials'}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                      <div className="relative pl-14 group">
                        <div className="absolute left-0 top-0 p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors ring-1 ring-slate-200">
                          {selectedReport.type === 'employee' ? <Briefcase className="h-5 w-5" /> :
                            ['income', 'expense'].includes(selectedReport.type) ? <Zap className="h-5 w-5" /> :
                              <ShieldCheck className="h-5 w-5" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          {selectedReport.type === 'employee' ? 'Designation' :
                            ['income', 'expense'].includes(selectedReport.type) ? 'Transaction Type' : 'Ownership'}
                        </p>
                        <p className="text-base font-bold text-slate-700 tracking-tight">
                          {selectedReport.type === 'employee' ? (selectedReport.designation || 'Staff') :
                            ['income', 'expense'].includes(selectedReport.type) ? (selectedReport.type_display || selectedReport.type || '-') :
                              (selectedReport.owner_name || '-')}
                        </p>
                      </div>

                      {!['income', 'expense'].includes(selectedReport.type) && (
                        <div className="relative pl-14 group">
                          <div className="absolute left-0 top-0 p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors ring-1 ring-slate-200">
                            <Users className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                            {selectedReport.type === 'employee' ? 'Department' : 'Key Liaison'}
                          </p>
                          <p className="text-base font-bold text-slate-700 tracking-tight">
                            {selectedReport.type === 'employee' ? (selectedReport.department || 'General') : (selectedReport.contact_person || '-')}
                          </p>
                        </div>
                      )}

                      {!['income', 'expense'].includes(selectedReport.type) && (
                        <div className="relative pl-14 group">
                          <div className="absolute left-0 top-0 p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors ring-1 ring-slate-200">
                            <Mail className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Electronic Mail</p>
                          <p className="text-base font-bold text-primary hover:underline decoration-primary/30 cursor-pointer transition-all">
                            {selectedReport.type === 'employee'
                              ? (selectedReport.email || selectedReport.employee_details?.email || selectedReport.employee_email || '-')
                              : (selectedReport.contact_email || '-')}
                          </p>
                        </div>
                      )}

                      {!['income', 'expense'].includes(selectedReport.type) && (
                        <div className="relative pl-14 group">
                          <div className="absolute left-0 top-0 p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors ring-1 ring-slate-200">
                            <Phone className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contact Channel</p>
                          <p className="text-base font-bold text-slate-700 tracking-tight">
                            {selectedReport.type === 'employee'
                              ? (selectedReport.phone_number || selectedReport.employee_details?.phone_number || selectedReport.phone || selectedReport.employee_phone || '-')
                              : (selectedReport.contact_phone || '-')}
                          </p>
                        </div>
                      )}

                      <div className="relative pl-14 group">
                        <div className="absolute left-0 top-10 p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors ring-1 ring-slate-200">
                          {selectedReport.type === 'employee' ? <CalendarCheck className="h-5 w-5" /> :
                            ['income', 'expense'].includes(selectedReport.type) ? <Clock className="h-5 w-5" /> :
                              <MapPin className="h-5 w-5" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          {selectedReport.type === 'employee' ? 'Joining Date' :
                            ['income', 'expense'].includes(selectedReport.type) ? 'Transaction Date' : 'Operational Base'}
                        </p>
                        <p className="text-base font-medium text-slate-600 leading-relaxed max-w-2xl">
                          {selectedReport.type === 'employee'
                            ? (selectedReport.joining_date || selectedReport.employee_details?.joining_date || selectedReport.date_joined || selectedReport.employee_details?.date_joined || selectedReport.joined_at || selectedReport.hire_date || selectedReport.employee_joining_date || 'N/A')
                            : ['income', 'expense'].includes(selectedReport.type) ? selectedReport.date : (selectedReport.location || 'Undisclosed Location')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {detailTab === 'payment' && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden bg-white ring-1 ring-slate-200/50 rounded-[3rem] relative">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-50/30 to-transparent rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none"></div>

                  <CardHeader className="py-10 px-12 border-b border-slate-100/60 bg-white relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Status: {selectedReport.status || 'Verified'}</p>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                          {selectedReport.type === 'employee' ? 'Salary' :
                            ['income', 'expense'].includes(selectedReport.type) ? 'Transaction' : 'Settlement'} <span className="text-slate-400 text-slate-500">Overview</span>
                        </h2>
                      </div>
                      <div className="bg-slate-50/80 backdrop-blur-md px-10 py-6 rounded-[2rem] ring-1 ring-slate-200/50 shadow-sm text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          {selectedReport.type === 'employee' ? 'Net Paid' :
                            ['income', 'expense'].includes(selectedReport.type) ? 'Total Amount' : 'Net Payable Amount'}
                        </p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                          ₹{(selectedReport.type === 'employee' ? selectedReport.net_paid :
                            ['income', 'expense'].includes(selectedReport.type) ? selectedReport.amount : selectedReport.net_amount)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-10 relative z-10">
                    <div className="max-w-none grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                      {/* Column 1: Financial Structure & Remarks */}
                      <div className="lg:col-span-9">
                        <div className="h-full p-8 bg-slate-50/50 rounded-[2.5rem] ring-1 ring-slate-100 shadow-inner flex flex-col gap-8">
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                              {selectedReport.type === 'employee' ? 'Salary Components' :
                                ['income', 'expense'].includes(selectedReport.type) ? 'Transaction Info' : 'Financial Breakdown'}
                            </p>
                            <div className="space-y-3">
                              {['income', 'expense'].includes(selectedReport.type) ? (
                                <>
                                  <div className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500">Transaction Date</span>
                                    <span className="text-sm font-black text-slate-800">{selectedReport.date}</span>
                                  </div>
                                  <div className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500">Category</span>
                                    <span className="text-sm font-black text-emerald-600">{selectedReport.category || selectedReport.category_name || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center group pb-3 border-b border-slate-200/50">
                                    <span className="text-xs font-bold text-slate-500">Payment Method</span>
                                    <span className="text-sm font-black text-slate-800 uppercase">{selectedReport.payment_method?.replace('_', ' ') || 'Direct'}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500">
                                      {selectedReport.type === 'employee' ? 'Base Salary' : 'Base Fee'}
                                    </span>
                                    <span className="text-sm font-black text-slate-800">
                                      ₹{(selectedReport.type === 'employee' ? selectedReport.base_salary : selectedReport.amount)?.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500">
                                      {selectedReport.type === 'employee' ? 'Incentives' : 'Tax/Comp.'}
                                    </span>
                                    <span className="text-sm font-black text-emerald-600">
                                      +₹{(selectedReport.type === 'employee' ? selectedReport.incentives : (['income', 'expense'].includes(selectedReport.type) ? selectedReport.gst_amount : selectedReport.tax))?.toLocaleString() || '0'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center group pb-3 border-b border-slate-200/50">
                                    <span className="text-xs font-bold text-slate-500">
                                      {selectedReport.type === 'employee' ? 'Deductions' : 'Discount'}
                                    </span>
                                    <span className="text-sm font-black text-rose-500">
                                      -₹{(selectedReport.type === 'employee' ? selectedReport.deductions : (['income', 'expense'].includes(selectedReport.type) ? 0 : selectedReport.discount))?.toLocaleString() || '0'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl ring-1 ring-slate-100 shadow-sm">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking_widest">Grand Total</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">
                              ₹{(selectedReport.type === 'employee' ? selectedReport.net_paid : (['income', 'expense'].includes(selectedReport.type) ? selectedReport.total_amount : selectedReport.net_amount))?.toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-slate-200/50">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
                              <span className="w-6 h-[2px] bg-emerald-200"></span> Auditor Remarks
                            </p>
                            <p className="text-xl font-black text-slate-900 leading-[1.4] tracking-tight italic">
                              {selectedReport.remarks ? `"${selectedReport.remarks}"` : "No additional auditor notes or remarks have been recorded for this period."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Logistics */}
                      <div className="lg:col-span-3 flex flex-col gap-3">
                        <div className="flex-1 p-5 bg-white ring-1 ring-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 rounded-xl group-hover:scale-105 transition-transform">
                            <CalendarCheck className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Settlement Date</p>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{selectedReport.payment_date || selectedReport.date || 'TBD'}</p>
                          </div>
                        </div>
                        <div className="flex-1 p-5 bg-white ring-1 ring-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                          <div className="p-3 bg-amber-50 rounded-xl group-hover:scale-105 transition-transform">
                            <Zap className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Via Channel</p>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{selectedReport.payment_method?.replace('_', ' ') || 'Direct Transfer'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {detailTab === 'content' && selectedReport.type !== 'employee' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-200/50">
                    <CardHeader className="py-8 px-10 border-b border-slate-50 bg-slate-50/20 flex flex-row items-center gap-5">
                      <div className="p-3.5 bg-blue-100 rounded-[1.2rem] shadow-sm transform group-hover:rotate-6 transition-transform">
                        <Layout className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black tracking-tight text-slate-800">Visual Asset Production</CardTitle>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Static Content Metrics</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                      {['Posters', 'Stories'].map((type) => {
                        const val = selectedReport.content_requirements?.[type.toLowerCase()] || { actual: 0, target: 0 };
                        const progress = Math.min(((val.actual || 0) / (val.target || 1)) * 100, 100);
                        return (
                          <div key={type} className="group cursor-default">
                            <div className="flex justify-between items-end mb-5">
                              <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Stream</p>
                                <p className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase italic">{type}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className={`mb-2 font-black border-2 ${progress >= 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                  {progress >= 100 ? 'MILESTONE ACHIEVED' : `${Math.round(progress)}% COMPLETE`}
                                </Badge>
                                <p className="text-2xl font-black text-slate-700">{val.actual || 0} <span className="text-base text-slate-300">/ {val.target}</span></p>
                              </div>
                            </div>
                            <div className="h-3.5 w-full bg-slate-100/80 rounded-full p-1 ring-1 ring-slate-200/50 shadow-inner overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20' : 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-500/20'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-200/50">
                    <CardHeader className="py-8 px-10 border-b border-slate-50 bg-slate-50/20 flex flex-row items-center gap-5">
                      <div className="p-3.5 bg-rose-100 rounded-[1.2rem] shadow-sm">
                        <Video className="h-5 w-5 text-rose-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black tracking-tight text-slate-800">Motion Media Verified</CardTitle>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Video & Reel Performance</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                      {['Videos', 'Reels'].map((type) => {
                        const val = selectedReport.content_requirements?.[type.toLowerCase()] || { actual: 0, target: 0 };
                        const progress = Math.min(((val.actual || 0) / (val.target || 1)) * 100, 100);
                        return (
                          <div key={type} className="group cursor-default">
                            <div className="flex justify-between items-end mb-5">
                              <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Stream</p>
                                <p className="text-xl font-black text-slate-800 group-hover:text-rose-600 transition-colors uppercase italic">{type}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className={`mb-2 font-black border-2 ${progress >= 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                  {progress >= 100 ? 'MILESTONE ACHIEVED' : `${Math.round(progress)}% COMPLETE`}
                                </Badge>
                                <p className="text-2xl font-black text-slate-700">{val.actual || 0} <span className="text-base text-slate-300">/ {val.target}</span></p>
                              </div>
                            </div>
                            <div className="h-3.5 w-full bg-slate-100/80 rounded-full p-1 ring-1 ring-slate-200/50 shadow-inner overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20' : 'bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-500/20'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {detailTab === 'tasks' && selectedReport.type === 'employee' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-200/50">
                  <CardHeader className="py-8 px-10 border-b border-slate-50 bg-slate-50/20 flex flex-row items-center gap-5">
                    <div className="p-3.5 bg-blue-100 rounded-[1.2rem] shadow-sm transform group-hover:rotate-6 transition-transform">
                      <Layout className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight text-slate-800">Monthly Task Overview</CardTitle>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Performance Metrics for {months.find(m => m.value === selectedMonth)?.label}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-3xl ring-1 ring-slate-200/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Tasks Completed</p>
                          <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                            {selectedReport.tasks_completed ?? selectedReport.completed_tasks ?? selectedReport.completed_count ?? 0}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">Successfully delivered milestones</p>
                        </div>
                        <div className="p-6 bg-amber-50 rounded-3xl ring-1 ring-amber-200/50">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Ongoing / Pending Tasks</p>
                          <h4 className="text-4xl font-black text-amber-900 tracking-tighter">
                            {selectedReport.tasks_pending ?? selectedReport.pending_tasks ?? selectedReport.pending_count ?? 0}
                          </h4>
                          <p className="text-xs text-amber-600/70 mt-1">Items currently in production</p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center space-y-4">
                        <div className="p-6 bg-emerald-50 rounded-3xl ring-1 ring-emerald-200/50">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Completion Rate</p>
                          <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black text-emerald-900 tracking-tighter">
                              {(() => {
                                const completed = selectedReport.tasks_completed ?? selectedReport.completed_tasks ?? selectedReport.completed_count ?? 0;
                                const pending = selectedReport.tasks_pending ?? selectedReport.pending_tasks ?? selectedReport.pending_count ?? 0;
                                const total = completed + pending;
                                return total === 0 ? 0 : Math.round((completed / total) * 100);
                              })()}%
                            </h4>
                          </div>
                          <div className="h-2 w-full bg-emerald-100 rounded-full mt-4 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${(() => {
                                  const completed = selectedReport.tasks_completed ?? selectedReport.completed_tasks ?? selectedReport.completed_count ?? 0;
                                  const pending = selectedReport.tasks_pending ?? selectedReport.pending_tasks ?? selectedReport.pending_count ?? 0;
                                  const total = completed + pending;
                                  return total === 0 ? 0 : Math.round((completed / total) * 100);
                                })()}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {detailTab === 'leaves' && selectedReport.type === 'employee' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-200/50">
                  <CardHeader className="py-8 px-10 border-b border-slate-50 bg-slate-50/20 flex flex-row items-center gap-5">
                    <div className="p-3.5 bg-purple-100 rounded-[1.2rem] shadow-sm transform group-hover:rotate-6 transition-transform">
                      <Clock className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight text-slate-800">Monthly Leave Log</CardTitle>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Attendance records for {months.find(m => m.value === selectedMonth)?.label}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="p-6 bg-purple-50 rounded-3xl ring-1 ring-purple-200/50">
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Total Leaves Taken</p>
                        <h4 className="text-4xl font-black text-purple-900 tracking-tighter">{selectedReport.leaves_count || 0}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Days away from work</p>
                      </div>
                      <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl ring-1 ring-slate-200/50 flex items-center">
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          {selectedReport.leaves_count > 0
                            ? `Details of leaves taken by ${selectedReport.employee_name} this month are listed below.`
                            : "The employee's attendance for this month shows consistent engagement. No leaves have been recorded for this period."}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-bold">Leave Type</TableHead>
                            <TableHead className="font-bold">Date Range</TableHead>
                            <TableHead className="font-bold">Days</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const empLeaves = leavesData.filter(l =>
                              l.employee_id === selectedReport.id ||
                              l.employee_name === selectedReport.employee_name
                            );

                            if (empLeaves.length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium border-2 border-dashed border-slate-50 rounded-3xl mt-4">
                                    No detailed leave records found for this period.
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            return empLeaves.map((leave, idx) => (
                              <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-semibold text-slate-700">{leave.category}</TableCell>
                                <TableCell className="text-slate-600 text-xs">
                                  {leave.start_date} to {leave.end_date}
                                </TableCell>
                                <TableCell className="font-black text-slate-900">{leave.total_days}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={leave.status_code === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold' : 'bg-amber-50 text-amber-600 border-amber-100 font-bold'}>
                                    {leave.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 italic text-xs max-w-[200px] truncate" title={leave.reason}>
                                  {leave.reason || 'No reason provided'}
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="clients" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-[800px] bg-slate-100/50">
            <TabsTrigger value="clients">Clients Report</TabsTrigger>
            <TabsTrigger value="employees">Employees Report</TabsTrigger>
            <TabsTrigger value="income">Income Report</TabsTrigger>
            <TabsTrigger value="expense">Expense Report</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Client Reports</CardTitle>
                  <CardDescription>
                    Overview of all client projects and status for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Retainer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.length > 0 ? (
                        clientData.map((client, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-semibold">{client.client_name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                {client.industry || 'Other'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{client.contact_email || '-'}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{client.contact_phone || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{client.location || '-'}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              ₹{client.monthly_retainer?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport({ ...client, type: 'client' })}
                                className="h-7 px-2 text-xs"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground italic font-medium">
                            No client payment has been processed for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                            <br />
                            <span className="text-xs opacity-70">The detailed report will be generated once the payment is marked as processed.</span>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Employee Reports</CardTitle>
                  <CardDescription>
                    Detailed list of employee payroll and status.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeData.length > 0 ? (
                        employeeData.map((employee, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{employee.employee_name}</TableCell>
                            <TableCell>{employee.department || 'N/A'}</TableCell>
                            <TableCell>₹{employee.base_salary?.toLocaleString() || '0'}</TableCell>
                            <TableCell className="capitalize">
                              {employee.gender || employee.employee_details?.gender || employee.employee_gender || '-'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {employee.email || employee.employee_details?.email || employee.employee_email || '-'}
                            </TableCell>
                            <TableCell>
                              {employee.phone_number || employee.employee_details?.phone_number || employee.phone || employee.employee_phone || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport({ ...employee, type: 'employee' })}
                                className="h-7 px-2 text-xs"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground italic font-medium">
                            No employee salary has been processed for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                            <br />
                            <span className="text-xs opacity-70">The report will be available once the salary is processed.</span>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Income Reports</CardTitle>
                  <CardDescription>
                    Financial income details for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">₹{incomeTotal.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Client/Source</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeData.length > 0 ? (
                        incomeData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">{item.date}</TableCell>
                            <TableCell className="font-medium">{item.type_display || item.type}</TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                                {item.category || item.category_name}
                              </span>
                            </TableCell>
                            <TableCell>{item.client_name || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              ₹{item.amount?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs uppercase">{item.payment_method?.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                              ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {item.status?.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport({ ...item, type: 'income' })}
                                className="h-7 px-2 text-xs"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                            No income records found for this period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Expense Reports</CardTitle>
                  <CardDescription>
                    Financial expense details for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">₹{expenseTotal.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseData.length > 0 ? (
                        expenseData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">{item.date}</TableCell>
                            <TableCell className="font-medium">{item.type_display || item.type}</TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                                {item.category || item.category_name}
                              </span>
                            </TableCell>
                            <TableCell>{item.vendor_name || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              ₹{item.amount?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs uppercase">{item.payment_method?.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                              ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {item.status?.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport({ ...item, type: 'expense' })}
                                className="h-7 px-2 text-xs"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                            No expense records found for this period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )
      }
    </div >
  );
};

export default Reports;
