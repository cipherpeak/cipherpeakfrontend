import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '@/axios';
import requests from '@/lib/urls';

// Types matching Django models
interface IncomeCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Income {
  id: number;
  type: string;
  type_display: string;
  amount: string;
  formatted_amount: string;
  category: number;
  category_name: string;
  date: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  remarks: string;
  reference_number?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  payment_method: string;
  payment_method_display: string;
  payment_status: string;
  payment_status_display: string;
  attachment?: string;
  created_by: number;
  created_by_name: string;
  last_modified_by?: number;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: number;
  type: string;
  type_display: string;
  amount: string;
  formatted_amount: string;
  category: number;
  category_name: string;
  date: string;
  vendor_name?: string;
  vendor_contact?: string;
  vendor_email?: string;
  vendor_phone?: string;
  remarks: string;
  reference_number?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  payment_method: string;
  payment_method_display: string;
  payment_status: string;
  payment_status_display: string;
  receipt?: string;
  created_by: number;
  created_by_name: string;
  last_modified_by?: number;
  created_at: string;
  updated_at: string;
}

interface IncomeFormData {
  type: string;
  amount: string;
  remarks: string;
  category: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  payment_method: string;
  payment_status: string;
}

interface ExpenseFormData {
  type: string;
  amount: string;
  remarks: string;
  category: string;
  vendor_name: string;
  vendor_contact: string;
  vendor_email: string;
  vendor_phone: string;
  payment_method: string;
  payment_status: string;
}

interface FinanceStats {
  total_income: number;
  total_expense: number;
  net_balance: number;
  income_count: number;
  expense_count: number;
  income_by_type: Array<{ type: string; total_amount: string; count: number }>;
  expense_by_type: Array<{ type: string; total_amount: string; count: number }>;
  income_by_category: Array<{ category__name: string; total_amount: string; count: number }>;
  expense_by_category: Array<{ category__name: string; total_amount: string; count: number }>;
}

const Dolla: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data states
  const [incomeForm, setIncomeForm] = useState<IncomeFormData>({
    type: '',
    amount: '',
    remarks: '',
    category: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    payment_method: 'bank_transfer',
    payment_status: 'completed'
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    type: '',
    amount: '',
    remarks: '',
    category: '',
    vendor_name: '',
    vendor_contact: '',
    vendor_email: '',
    vendor_phone: '',
    payment_method: 'bank_transfer',
    payment_status: 'completed'
  });

  // Common income types
  const incomeTypes = [
    'client_payment',
    'consulting_fee',
    'product_sale',
    'subscription_revenue',
    'investment_return',
    'other_income'
  ];

  // Common expense types
  const expenseTypes = [
    'software_subscription',
    'office_rent',
    'utilities',
    'marketing',
    'business_travel',
    'equipment_purchase',
    'employee_salaries',
    'office_supplies',
    'professional_services',
    'other_expense'
  ];

  // Payment methods
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' }
  ];

  // Payment statuses
  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // API Functions
  const fetchIncomes = async () => {
    try {
      setIncomeLoading(true);
      setError(null);
      const response = await axiosInstance.get(requests.FetchIncomes);
      setIncomes(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching incomes:', err);
      setError(err.response?.data?.error || 'Failed to fetch incomes');
    } finally {
      setIncomeLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setExpenseLoading(true);
      setError(null);
      const response = await axiosInstance.get(requests.FetchExpenses);
      setExpenses(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.error || 'Failed to fetch expenses');
    } finally {
      setExpenseLoading(false);
    }
  };

  const fetchIncomeCategories = async () => {
    try {
      const response = await axiosInstance.get(requests.FetchIncomeCategories);
      setIncomeCategories(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching income categories:', err);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await axiosInstance.get(requests.FetchExpenseCategories);
      setExpenseCategories(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching expense categories:', err);
    }
  };

  const fetchFinanceStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axiosInstance.get(requests.FinanceStats);
      setFinanceStats(response.data);
    } catch (err: any) {
      console.error('Error fetching finance stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const createIncome = async (incomeData: any) => {
    try {
      const response = await axiosInstance.post(requests.CreateIncome, incomeData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create income');
    }
  };

  const updateIncome = async (id: number, incomeData: any) => {
    try {
      const response = await axiosInstance.put(`${requests.UpdateIncome}${id}/`, incomeData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update income');
    }
  };

  const deleteIncome = async (id: number) => {
    try {
      await axiosInstance.delete(`${requests.DeleteIncome}${id}/`);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete income');
    }
  };

  const createExpense = async (expenseData: any) => {
    try {
      const response = await axiosInstance.post(requests.CreateExpense, expenseData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create expense');
    }
  };

  const updateExpense = async (id: number, expenseData: any) => {
    try {
      const response = await axiosInstance.put(`${requests.UpdateExpense}${id}/`, expenseData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update expense');
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await axiosInstance.delete(`${requests.DeleteExpense}${id}/`);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete expense');
    }
  };

  // Handlers for Income
  const handleAddIncome = async () => {
    try {
      setLoading(true);
      setError(null);

      const incomeData = {
        type: incomeForm.type,
        amount: incomeForm.amount,
        remarks: incomeForm.remarks,
        category: incomeForm.category,
        client_name: incomeForm.client_name,
        client_email: incomeForm.client_email,
        client_phone: incomeForm.client_phone,
        payment_method: incomeForm.payment_method,
        payment_status: incomeForm.payment_status,
        date: format(new Date(), 'yyyy-MM-dd'),
      };

      if (editingIncome) {
        await updateIncome(editingIncome.id, incomeData);
      } else {
        await createIncome(incomeData);
      }

      await fetchIncomes();
      await fetchFinanceStats();
      resetIncomeForm();
      setIncomeDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeForm({
      type: income.type,
      amount: income.amount,
      remarks: income.remarks,
      category: income.category.toString(),
      client_name: income.client_name || '',
      client_email: income.client_email || '',
      client_phone: income.client_phone || '',
      payment_method: income.payment_method,
      payment_status: income.payment_status
    });
    setIncomeDialogOpen(true);
  };

  const handleDeleteIncome = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income record?')) {
      return;
    }

    try {
      await deleteIncome(id);
      await fetchIncomes();
      await fetchFinanceStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      type: '',
      amount: '',
      remarks: '',
      category: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      payment_method: 'bank_transfer',
      payment_status: 'completed'
    });
    setEditingIncome(null);
  };

  // Handlers for Expense
  const handleAddExpense = async () => {
    try {
      setLoading(true);
      setError(null);

      const expenseData = {
        type: expenseForm.type,
        amount: expenseForm.amount,
        remarks: expenseForm.remarks,
        category: expenseForm.category,
        vendor_name: expenseForm.vendor_name,
        vendor_contact: expenseForm.vendor_contact,
        vendor_email: expenseForm.vendor_email,
        vendor_phone: expenseForm.vendor_phone,
        payment_method: expenseForm.payment_method,
        payment_status: expenseForm.payment_status,
        date: format(new Date(), 'yyyy-MM-dd'),
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      await fetchExpenses();
      await fetchFinanceStats();
      resetExpenseForm();
      setExpenseDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      type: expense.type,
      amount: expense.amount,
      remarks: expense.remarks,
      category: expense.category.toString(),
      vendor_name: expense.vendor_name || '',
      vendor_contact: expense.vendor_contact || '',
      vendor_email: expense.vendor_email || '',
      vendor_phone: expense.vendor_phone || '',
      payment_method: expense.payment_method,
      payment_status: expense.payment_status
    });
    setExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await deleteExpense(id);
      await fetchExpenses();
      await fetchFinanceStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      type: '',
      amount: '',
      remarks: '',
      category: '',
      vendor_name: '',
      vendor_contact: '',
      vendor_email: '',
      vendor_phone: '',
      payment_method: 'bank_transfer',
      payment_status: 'completed'
    });
    setEditingExpense(null);
  };

  // Filtered data
  const filteredIncomes = incomes.filter(income => 
    income.type_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(income => 
    categoryFilter === 'all' || income.category_name === categoryFilter
  );

  const filteredExpenses = expenses.filter(expense => 
    expense.type_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(expense => 
    categoryFilter === 'all' || expense.category_name === categoryFilter
  );

  // Format type display
  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get status color
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Initialize data
  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
    fetchIncomeCategories();
    fetchExpenseCategories();
    fetchFinanceStats();
  }, []);

  // Calculate totals from stats or fallback to local calculation
  const totalIncome = financeStats?.total_income || incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const totalExpense = financeStats?.total_expense || expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const netBalance = financeStats?.net_balance || (totalIncome - totalExpense);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dolla</h1>
            <p className="text-slate-600 mt-2">Manage your income and expenses efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              className="gap-2"
              onClick={() => {
                if (activeTab === 'income') {
                  resetIncomeForm();
                  setIncomeDialogOpen(true);
                } else {
                  resetExpenseForm();
                  setExpenseDialogOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add {activeTab === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-900">₹{totalIncome.toLocaleString()}</div>
                  <p className="text-xs text-green-700">{financeStats?.income_count || incomes.length} records</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-red-600" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-900">₹{totalExpense.toLocaleString()}</div>
                  <p className="text-xs text-red-700">{financeStats?.expense_count || expenses.length} records</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    ₹{netBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-700">Current balance</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Financial Transactions</CardTitle>
                <CardDescription>
                  Manage and track all your income and expenses in one place
                </CardDescription>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {activeTab === 'income' 
                      ? incomeCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      : expenseCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'income' | 'expense')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Income
                  <Badge variant="secondary" className="ml-1">
                    {incomes.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Expenses
                  <Badge variant="secondary" className="ml-1">
                    {expenses.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Income Tab */}
              <TabsContent value="income" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Income Records</h3>
                  <Button 
                    onClick={() => { resetIncomeForm(); setIncomeDialogOpen(true); }} 
                    className="gap-2"
                    disabled={incomeLoading}
                  >
                    {incomeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Income
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Loading incomes...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredIncomes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <div>No income records found</div>
                            <Button 
                              variant="outline" 
                              className="mt-3"
                              onClick={() => { resetIncomeForm(); setIncomeDialogOpen(true); }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Income
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredIncomes.map((income) => (
                          <TableRow key={income.id}>
                            <TableCell className="font-medium">{income.type_display || formatType(income.type)}</TableCell>
                            <TableCell>{income.client_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {income.category_name}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {income.formatted_amount || `₹${parseFloat(income.amount).toLocaleString()}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(income.date), 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPaymentStatusColor(income.payment_status)}>
                                {income.payment_status_display || formatType(income.payment_status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={income.remarks}>
                              {income.remarks}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditIncome(income)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteIncome(income.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Expense Tab */}
              <TabsContent value="expense" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Expense Records</h3>
                  <Button 
                    onClick={() => { resetExpenseForm(); setExpenseDialogOpen(true); }} 
                    className="gap-2"
                    disabled={expenseLoading}
                  >
                    {expenseLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Expense
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Loading expenses...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <div>No expense records found</div>
                            <Button 
                              variant="outline" 
                              className="mt-3"
                              onClick={() => { resetExpenseForm(); setExpenseDialogOpen(true); }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Expense
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.type_display || formatType(expense.type)}</TableCell>
                            <TableCell>{expense.vendor_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                {expense.category_name}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              {expense.formatted_amount || `₹${parseFloat(expense.amount).toLocaleString()}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(expense.date), 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPaymentStatusColor(expense.payment_status)}>
                                {expense.payment_status_display || formatType(expense.payment_status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={expense.remarks}>
                              {expense.remarks}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditExpense(expense)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Income Dialog */}
      <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </DialogTitle>
            <DialogDescription>
              {editingIncome ? 'Update the income details' : 'Add a new income record to your financial dashboard'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-type">Income Type *</Label>
                <Select 
                  value={incomeForm.type} 
                  onValueChange={(value) => setIncomeForm({...incomeForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-amount">Amount *</Label>
                <Input
                  id="income-amount"
                  type="number"
                  placeholder="0.00"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-category">Category *</Label>
                <Select 
                  value={incomeForm.category} 
                  onValueChange={(value) => setIncomeForm({...incomeForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  placeholder="Enter client name"
                  value={incomeForm.client_name}
                  onChange={(e) => setIncomeForm({...incomeForm, client_name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select 
                  value={incomeForm.payment_method} 
                  onValueChange={(value) => setIncomeForm({...incomeForm, payment_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-status">Payment Status</Label>
                <Select 
                  value={incomeForm.payment_status} 
                  onValueChange={(value) => setIncomeForm({...incomeForm, payment_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-remarks">Remarks</Label>
              <Textarea
                id="income-remarks"
                placeholder="Add any remarks or notes about this income..."
                value={incomeForm.remarks}
                onChange={(e) => setIncomeForm({...incomeForm, remarks: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIncomeDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddIncome} 
              disabled={!incomeForm.type || !incomeForm.amount || !incomeForm.category || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {editingIncome ? 'Update Income' : 'Add Income'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
            <DialogDescription>
              {editingExpense ? 'Update the expense details' : 'Add a new expense record to your financial dashboard'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-type">Expense Type *</Label>
                <Select 
                  value={expenseForm.type} 
                  onValueChange={(value) => setExpenseForm({...expenseForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount *</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category *</Label>
                <Select 
                  value={expenseForm.category} 
                  onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name</Label>
                <Input
                  id="vendor"
                  placeholder="Enter vendor name"
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({...expenseForm, vendor_name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-payment-method">Payment Method</Label>
                <Select 
                  value={expenseForm.payment_method} 
                  onValueChange={(value) => setExpenseForm({...expenseForm, payment_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-payment-status">Payment Status</Label>
                <Select 
                  value={expenseForm.payment_status} 
                  onValueChange={(value) => setExpenseForm({...expenseForm, payment_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-remarks">Remarks</Label>
              <Textarea
                id="expense-remarks"
                placeholder="Add any remarks or notes about this expense..."
                value={expenseForm.remarks}
                onChange={(e) => setExpenseForm({...expenseForm, remarks: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setExpenseDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpense} 
              disabled={!expenseForm.type || !expenseForm.amount || !expenseForm.category || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dolla;