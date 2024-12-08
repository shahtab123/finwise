'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Wallet,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  Calculator,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BellRing,
  Edit,
  Trash,
  Calendar,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Interfaces
interface Loan {
  id: string;
  purpose: string;
  lender: string;
  principalAmount: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  emiAmount: number;
  status: 'Active' | 'Closed' | 'Default';
  type: 'Personal' | 'Business' | 'Mortgage' | 'Auto' | 'Education' | 'Other';
  paymentFrequency: 'Monthly' | 'Quarterly' | 'Yearly';
  collateral?: string;
  notes?: string;
}

interface Payment {
  id: string;
  loanId: string;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paymentNumber: number;
  totalPayments: number;
}

// Loan List Component
export function LoanList() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showEditLoan, setShowEditLoan] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedLoans = localStorage.getItem('finwise_loans');
    if (savedLoans) {
      setLoans(JSON.parse(savedLoans));
    }
  }, [refreshTrigger]);

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowEditLoan(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const updatedLoans = loans.map(loan => 
      loan.id === selectedLoan.id ? selectedLoan : loan
    );
    
    setLoans(updatedLoans);
    localStorage.setItem('finwise_loans', JSON.stringify(updatedLoans));
    setShowEditLoan(false);
    setSelectedLoan(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteLoan = (id: string) => {
    const updatedLoans = loans.filter(loan => loan.id !== id);
    setLoans(updatedLoans);
    localStorage.setItem('finwise_loans', JSON.stringify(updatedLoans));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Loans</CardTitle>
            <CardDescription>Manage your loan portfolio</CardDescription>
          </div>
          <Button onClick={() => setShowAddLoan(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Loan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Purpose</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>EMI</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No loans added yet. Click "Add Loan" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{loan.purpose}</p>
                          <p className="text-sm text-muted-foreground">{loan.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{loan.lender}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>${loan.principalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          ${loan.remainingAmount.toLocaleString()} remaining
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>${loan.emiAmount.toLocaleString()}/mo</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        loan.status === 'Active' ? 'success' :
                        loan.status === 'Closed' ? 'secondary' : 'destructive'
                      }>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(loan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLoan(loan.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={showEditLoan} onOpenChange={setShowEditLoan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
            <DialogDescription>Update loan details</DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Purpose</label>
                  <Input
                    className="col-span-3"
                    value={selectedLoan.purpose}
                    onChange={(e) => setSelectedLoan({
                      ...selectedLoan,
                      purpose: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Lender</label>
                  <Input
                    className="col-span-3"
                    value={selectedLoan.lender}
                    onChange={(e) => setSelectedLoan({
                      ...selectedLoan,
                      lender: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Principal Amount</label>
                  <Input
                    type="number"
                    className="col-span-3"
                    value={selectedLoan.principalAmount}
                    onChange={(e) => setSelectedLoan({
                      ...selectedLoan,
                      principalAmount: parseFloat(e.target.value),
                      remainingAmount: parseFloat(e.target.value)
                    })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Interest Rate (%)</label>
                  <Input
                    type="number"
                    className="col-span-3"
                    value={selectedLoan.interestRate}
                    onChange={(e) => setSelectedLoan({
                      ...selectedLoan,
                      interestRate: parseFloat(e.target.value)
                    })}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Type</label>
                  <Select
                    value={selectedLoan.type}
                    onValueChange={(value: Loan['type']) => 
                      setSelectedLoan({
                        ...selectedLoan,
                        type: value
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal Loan</SelectItem>
                      <SelectItem value="Business">Business Loan</SelectItem>
                      <SelectItem value="Mortgage">Mortgage</SelectItem>
                      <SelectItem value="Auto">Auto Loan</SelectItem>
                      <SelectItem value="Education">Education Loan</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Status</label>
                  <Select
                    value={selectedLoan.status}
                    onValueChange={(value: Loan['status']) => 
                      setSelectedLoan({
                        ...selectedLoan,
                        status: value
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Default">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AddLoanDialog 
        open={showAddLoan} 
        onOpenChange={setShowAddLoan}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </Card>
  );
}

// EMI Calculator Component
export function EMICalculator() {
  const [formData, setFormData] = useState({
    amount: '',
    rate: '',
    tenure: '',
    frequency: 'Monthly' as const
  });

  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalPayment: number;
    amortization: Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
  }>({
    emi: 0,
    totalInterest: 0,
    totalPayment: 0,
    amortization: []
  });

  const calculateEMI = () => {
    const P = parseFloat(formData.amount);
    const R = parseFloat(formData.rate) / 1200; // Monthly interest rate
    const N = parseFloat(formData.tenure) * 12; // Total number of months

    const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    // Calculate amortization schedule
    let balance = P;
    const amortization = [];

    for (let i = 1; i <= N; i++) {
      const interest = balance * R;
      const principal = emi - interest;
      balance -= principal;

      amortization.push({
        month: i,
        payment: emi,
        principal,
        interest,
        balance: Math.max(0, balance)
      });
    }

    setResult({
      emi,
      totalInterest,
      totalPayment,
      amortization
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>EMI Calculator</CardTitle>
          <CardDescription>Calculate your loan EMI and payment schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Loan Amount</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter loan amount"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Interest Rate (%)</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="Annual interest rate"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Tenure (Years)</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                placeholder="Loan tenure in years"
              />
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={calculateEMI}
              disabled={!formData.amount || !formData.rate || !formData.tenure}
            >
              Calculate EMI
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Loan repayment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-2xl font-bold">${result.emi.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold">${result.totalInterest.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="text-2xl font-bold">${result.totalPayment.toLocaleString()}</p>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.amortization}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'bottom' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => `$${parseFloat(value).toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    name="Balance" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Update the DebtTimeline component
export function DebtTimeline() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [visibleMonths, setVisibleMonths] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    const savedPayments = localStorage.getItem('finwise_loan_payments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Group payments by month
  const groupedPayments = payments.reduce((groups: { [key: string]: Payment[] }, payment) => {
    const date = new Date(payment.dueDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(payment);
    return groups;
  }, {});

  // Get sorted months
  const sortedMonths = Object.entries(groupedPayments)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

  // Get visible months
  const visibleMonthsData = sortedMonths.slice(0, visibleMonths);
  const hasMoreMonths = sortedMonths.length > visibleMonths;

  const handleShowMore = () => {
    setVisibleMonths(prev => prev + 10);
  };

  return (
    <div className="space-y-4">
      {visibleMonthsData.map(([monthYear, monthPayments]) => (
        <Card key={monthYear}>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{monthYear}</CardTitle>
                <CardDescription className="text-sm">
                  {monthPayments.length} payment{monthPayments.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-2">
              {monthPayments
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((payment) => (
                  <div 
                    key={payment.id}
                    className={cn(
                      "p-3 rounded-lg",
                      payment.status === 'Paid' ? "bg-emerald-500/10" :
                      payment.status === 'Overdue' ? "bg-red-500/10" :
                      "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          payment.status === 'Paid' ? "bg-emerald-500/20" :
                          payment.status === 'Overdue' ? "bg-red-500/20" :
                          "bg-muted"
                        )}>
                          {payment.status === 'Paid' ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : payment.status === 'Overdue' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Payment #{payment.paymentNumber}</p>
                            <Badge variant={
                              payment.status === 'Paid' ? 'success' :
                              payment.status === 'Overdue' ? 'destructive' :
                              'secondary'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <div className="flex gap-1 text-xs text-muted-foreground">
                            <span>P: ${payment.principal.toLocaleString()}</span>
                            <span>•</span>
                            <span>I: ${payment.interest.toLocaleString()}</span>
                          </div>
                        </div>
                        {payment.status === 'Pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : payment.status === 'Paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsUnpaid(payment.id)}
                          >
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMoreMonths && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleShowMore}
            className="w-full max-w-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Show More Months
          </Button>
        </div>
      )}

      {payments.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No payments scheduled yet. Add a loan to generate payment schedule.
        </div>
      )}
    </div>
  );
}

// Add Loan Dialog Component
export function AddLoanDialog({ 
  open, 
  onOpenChange,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [formData, setFormData] = useState({
    purpose: '',
    lender: '',
    principalAmount: '',
    interestRate: '',
    startDate: '',
    endDate: '',
    type: 'Personal' as const,
    paymentFrequency: 'Monthly' as const,
    collateral: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const principal = parseFloat(formData.principalAmount);
    const rate = parseFloat(formData.interestRate) / 1200; // Monthly rate
    const months = Math.ceil(
      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) 
      / (1000 * 60 * 60 * 24 * 30)
    );

    const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);

    const newLoan: Loan = {
      id: crypto.randomUUID(),
      ...formData,
      principalAmount: principal,
      remainingAmount: principal,
      interestRate: parseFloat(formData.interestRate),
      emiAmount: emi,
      status: 'Active' as const,
      type: formData.type,
      paymentFrequency: formData.paymentFrequency
    };

    const existingLoans = JSON.parse(localStorage.getItem('finwise_loans') || '[]');
    const updatedLoans = [...existingLoans, newLoan];
    localStorage.setItem('finwise_loans', JSON.stringify(updatedLoans));

    // Generate payment schedule
    const payments: Payment[] = [];
    let balance = principal;
    
    for (let i = 1; i <= months; i++) {
      const interest = balance * rate;
      const principal = emi - interest;
      balance -= principal;

      payments.push({
        id: crypto.randomUUID(),
        loanId: newLoan.id,
        dueDate: new Date(new Date(formData.startDate).setMonth(
          new Date(formData.startDate).getMonth() + i
        )).toISOString(),
        amount: emi,
        principal,
        interest,
        status: 'Pending',
        paymentNumber: i,
        totalPayments: months
      });
    }

    const existingPayments = JSON.parse(localStorage.getItem('finwise_loan_payments') || '[]');
    localStorage.setItem('finwise_loan_payments', JSON.stringify([...existingPayments, ...payments]));

    if (onSuccess) {
      onSuccess();
    }

    onOpenChange(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
          <DialogDescription>Enter loan details to start tracking</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Purpose</label>
              <Input
                className="col-span-3"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Loan purpose"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Lender</label>
              <Input
                className="col-span-3"
                value={formData.lender}
                onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                placeholder="Bank or lender name"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Amount</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                placeholder="Principal amount"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Interest Rate (%)</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="Annual interest rate"
                required
                min="0"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Start Date</label>
              <Input
                type="date"
                className="col-span-3"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">End Date</label>
              <Input
                type="date"
                className="col-span-3"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: Loan['type']) => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal Loan</SelectItem>
                  <SelectItem value="Business">Business Loan</SelectItem>
                  <SelectItem value="Mortgage">Mortgage</SelectItem>
                  <SelectItem value="Auto">Auto Loan</SelectItem>
                  <SelectItem value="Education">Education Loan</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Payment Frequency</label>
              <Select
                value={formData.paymentFrequency}
                onValueChange={(value: Loan['paymentFrequency']) => 
                  setFormData({ ...formData, paymentFrequency: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Collateral</label>
              <Input
                className="col-span-3"
                value={formData.collateral}
                onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                placeholder="Asset used as collateral (optional)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Notes</label>
              <Input
                className="col-span-3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Loan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Loan Insights Component
export function LoanInsights() {
  const [insights, setInsights] = useState<Array<{
    title: string;
    description: string;
    type: 'warning' | 'success' | 'info';
    action?: string;
  }>>([]);

  useEffect(() => {
    const loans = JSON.parse(localStorage.getItem('finwise_loans') || '[]');
    const payments = JSON.parse(localStorage.getItem('finwise_loan_payments') || '[]');

    const newInsights = [];

    // Check for high interest rates
    const highInterestLoans = loans.filter((loan: Loan) => loan.interestRate > 10);
    if (highInterestLoans.length > 0) {
      newInsights.push({
        title: 'High Interest Loans Detected',
        description: `${highInterestLoans.length} loans have interest rates above 10%. Consider refinancing options.`,
        type: 'warning'
      });
    }

    // Check for upcoming payments
    const upcomingPayments = payments.filter((p: Payment) => {
      const dueDate = new Date(p.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 7 && p.status === 'Pending';
    });

    if (upcomingPayments.length > 0) {
      newInsights.push({
        title: 'Upcoming Payments',
        description: `You have ${upcomingPayments.length} payments due in the next 7 days.`,
        type: 'info'
      });
    }

    // Check for overdue payments
    const overduePayments = payments.filter((p: Payment) => p.status === 'Overdue');
    if (overduePayments.length > 0) {
      newInsights.push({
        title: 'Overdue Payments',
        description: `You have ${overduePayments.length} overdue payments. Please take immediate action.`,
        type: 'warning'
      });
    }

    // Check for loans near completion
    const nearingCompletion = loans.filter((loan: Loan) => {
      const totalPaid = payments
        .filter((p: Payment) => p.loanId === loan.id && p.status === 'Paid')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);
      return (totalPaid / loan.principalAmount) > 0.9;
    });

    if (nearingCompletion.length > 0) {
      newInsights.push({
        title: 'Almost There!',
        description: `${nearingCompletion.length} loans are over 90% paid off. Keep it up!`,
        type: 'success'
      });
    }

    setInsights(newInsights);
  }, []);

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={cn(
            "p-4 rounded-lg",
            insight.type === 'warning' && "bg-yellow-500/10",
            insight.type === 'success' && "bg-emerald-500/10",
            insight.type === 'info' && "bg-blue-500/10"
          )}
        >
          <div className="flex items-center gap-4">
            <AlertCircle className={cn(
              "h-5 w-5",
              insight.type === 'warning' && "text-yellow-500",
              insight.type === 'success' && "text-emerald-500",
              insight.type === 'info' && "text-blue-500"
            )} />
            <div>
              <p className="font-medium">{insight.title}</p>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              {insight.action && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                >
                  {insight.action}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {insights.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No insights available at the moment.
        </div>
      )}
    </div>
  );
} 