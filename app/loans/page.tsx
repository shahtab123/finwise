'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Wallet,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Calculator,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BellRing,
  HelpCircle,
  Trash,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  LoanList, 
  EMICalculator, 
  DebtTimeline,
  AddLoanDialog,
  LoanInsights
} from "@/components/loans/LoanComponents"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Add this constant for guide content
const LOAN_GUIDE = {
  overview: {
    title: "Loan & Debt Management Guide",
    description: "Learn how to effectively manage your loans and track repayments.",
    sections: [
      {
        title: "Getting Started",
        items: [
          "Add loans with their terms and payment schedules",
          "Track EMIs and payment history",
          "Monitor interest rates and refinancing opportunities",
          "Set up payment reminders"
        ]
      },
      {
        title: "Key Features",
        items: [
          "Loan Portfolio: Track all your loans in one place",
          "EMI Calculator: Calculate loan payments and amortization",
          "Payment Timeline: View upcoming payments",
          "Smart Insights: Get recommendations for loan optimization"
        ]
      },
      {
        title: "Best Practices",
        items: [
          "Regularly review interest rates for refinancing opportunities",
          "Set up automatic payment reminders",
          "Track total debt-to-income ratio",
          "Monitor prepayment opportunities",
          "Keep loan documentation organized"
        ]
      }
    ]
  },
  features: [
    {
      title: "Loan Management",
      description: "Track all your loans, their terms, and payment schedules in one centralized dashboard.",
      icon: Wallet
    },
    {
      title: "EMI Calculator",
      description: "Calculate EMIs, view amortization schedules, and plan loan repayments effectively.",
      icon: Calculator
    },
    {
      title: "Payment Tracking",
      description: "Monitor upcoming payments, payment history, and set up payment reminders.",
      icon: Clock
    },
    {
      title: "Smart Insights",
      description: "Get AI-powered recommendations for loan optimization and refinancing opportunities.",
      icon: TrendingDown
    }
  ]
};

// Add test data constant
const TEST_LOANS = [
  {
    id: crypto.randomUUID(),
    purpose: "Home Mortgage",
    lender: "City Bank",
    principalAmount: 300000,
    remainingAmount: 275000,
    interestRate: 4.5,
    startDate: "2024-01-01",
    endDate: "2053-12-31",
    emiAmount: 1520.06,
    status: 'Active' as const,
    type: 'Mortgage' as const,
    paymentFrequency: 'Monthly' as const,
    collateral: "Property at 123 Main St"
  },
  {
    id: crypto.randomUUID(),
    purpose: "Car Loan",
    lender: "Auto Finance Co",
    principalAmount: 35000,
    remainingAmount: 28000,
    interestRate: 6.5,
    startDate: "2023-09-15",
    endDate: "2028-09-15",
    emiAmount: 684.12,
    status: 'Active' as const,
    type: 'Auto' as const,
    paymentFrequency: 'Monthly' as const,
    collateral: "2024 Tesla Model 3"
  },
  {
    id: crypto.randomUUID(),
    purpose: "Business Expansion",
    lender: "Growth Capital Ltd",
    principalAmount: 100000,
    remainingAmount: 95000,
    interestRate: 8.5,
    startDate: "2024-02-01",
    endDate: "2029-02-01",
    emiAmount: 2052.73,
    status: 'Active' as const,
    type: 'Business' as const,
    paymentFrequency: 'Monthly' as const
  }
];

// Add this constant for chart colors
const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#f59e0b', '#8b5cf6'];

export default function LoansPage() {
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    totalDebt: 0,
    monthlyPayment: 0,
    upcomingPayments: 0,
    overdue: 0,
    debtDistribution: [],
    paymentSchedule: []
  });

  const calculateStats = () => {
    const loans = JSON.parse(localStorage.getItem('finwise_loans') || '[]');
    const payments = JSON.parse(localStorage.getItem('finwise_loan_payments') || '[]');

    const totalDebt = loans.reduce((sum: number, loan: any) => sum + loan.remainingAmount, 0);
    const monthlyPayment = loans.reduce((sum: number, loan: any) => sum + loan.emiAmount, 0);

    const today = new Date();
    const upcomingPayments = payments.filter((p: any) => {
      const dueDate = new Date(p.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 30;
    }).length;

    const overdue = payments.filter((p: any) => {
      const dueDate = new Date(p.dueDate);
      return dueDate < today && p.status === 'Pending';
    }).length;

    setData({
      totalDebt,
      monthlyPayment,
      upcomingPayments,
      overdue,
      debtDistribution: loans.map((loan: any) => ({
        name: loan.purpose,
        value: loan.remainingAmount
      })),
      paymentSchedule: payments
        .filter((p: any) => p.status === 'Pending')
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)
    });
  };

  useEffect(() => {
    calculateStats();

    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const generatePDF = async () => {
    // Implement PDF generation logic
  };

  const generateLoanReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Loan & Debt Management Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 14, 35);
    
    const summaryData = [
      ['Total Debt', `$${data.totalDebt.toLocaleString()}`],
      ['Monthly Payments', `$${data.monthlyPayment.toLocaleString()}`],
      ['Upcoming Payments', data.upcomingPayments],
      ['Overdue Payments', data.overdue]
    ];

    // Add summary table
    let yPos = 40;
    pdf.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });

    // Add active loans
    yPos = pdf.lastAutoTable.finalY + 15;
    pdf.text('Active Loans', 14, yPos);
    
    // Get loans from localStorage
    const loans = JSON.parse(localStorage.getItem('finwise_loans') || '[]');
    const activeLoans = loans.filter(loan => loan.status === 'Active');
    const loanData = activeLoans.map(loan => [
      loan.purpose,
      loan.lender,
      `$${loan.principalAmount.toLocaleString()}`,
      `$${loan.remainingAmount.toLocaleString()}`,
      `${loan.interestRate}%`,
      `$${loan.emiAmount.toLocaleString()}`,
      loan.paymentFrequency
    ]);

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Purpose', 'Lender', 'Principal', 'Remaining', 'Interest', 'EMI', 'Frequency']],
      body: loanData,
      theme: 'grid',
    });

    // Add payment schedule
    yPos = pdf.lastAutoTable.finalY + 15;
    pdf.text('Upcoming Payments', 14, yPos);
    
    const payments = JSON.parse(localStorage.getItem('finwise_loan_payments') || '[]');
    const upcomingPayments = payments
      .filter(p => p.status === 'Pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const paymentData = upcomingPayments.map(payment => [
      `Payment #${payment.paymentNumber}`,
      new Date(payment.dueDate).toLocaleDateString(),
      `$${payment.amount.toLocaleString()}`,
      `$${payment.principal.toLocaleString()}`,
      `$${payment.interest.toLocaleString()}`,
      payment.status
    ]);

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Payment', 'Due Date', 'Amount', 'Principal', 'Interest', 'Status']],
      body: paymentData,
      theme: 'grid',
    });

    // Save the PDF
    pdf.save(`loan-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Loan & Debt Manager</h1>
          <p className="text-muted-foreground mt-1">
            Track and optimize your loan portfolio
            <Button 
              variant="link" 
              className="text-primary px-1 h-auto"
              onClick={() => setShowGuide(true)}
            >
              Learn how to use
            </Button>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.setItem('finwise_loans', JSON.stringify(TEST_LOANS));
              // Generate test payments
              const payments = TEST_LOANS.flatMap(loan => {
                const startDate = new Date(loan.startDate);
                const endDate = new Date(loan.endDate);
                const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                
                return Array.from({ length: Math.min(months, 12) }).map((_, i) => ({
                  id: crypto.randomUUID(),
                  loanId: loan.id,
                  dueDate: new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()).toISOString(),
                  amount: loan.emiAmount,
                  principal: loan.emiAmount * 0.7, // Simplified calculation
                  interest: loan.emiAmount * 0.3,  // Simplified calculation
                  status: i < 3 ? 'Paid' : 'Pending',
                  paymentNumber: i + 1,
                  totalPayments: months
                }));
              });
              localStorage.setItem('finwise_loan_payments', JSON.stringify(payments));
              calculateStats();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Load Test Data
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              localStorage.removeItem('finwise_loans');
              localStorage.removeItem('finwise_loan_payments');
              calculateStats();
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Reset Data
          </Button>
          <Button variant="outline" onClick={() => setShowGuide(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Guide
          </Button>
          <Button onClick={() => setShowAddLoan(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Loan
          </Button>
          <Button onClick={generateLoanReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(data.totalDebt)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(data.monthlyPayment)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Payments</p>
                <h3 className="text-2xl font-bold mt-1">{data.upcomingPayments}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <h3 className="text-2xl font-bold mt-1">{data.overdue}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="calculator">EMI Calculator</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Debt Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Debt Distribution</CardTitle>
                <CardDescription>Breakdown of your loan portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.debtDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {data.debtDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Debt</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.totalDebt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly Payments</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.monthlyPayment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Loan Insights</CardTitle>
                    <CardDescription>Recommendations and alerts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => calculateStats()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upcoming Payments Alert */}
                  {data.upcomingPayments > 0 && (
                    <div className="p-4 rounded-lg bg-blue-500/10">
                      <div className="flex items-center gap-4">
                        <BellRing className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Upcoming Payments</p>
                          <p className="text-sm text-muted-foreground">
                            You have {data.upcomingPayments} payments due in the next 30 days
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overdue Payments Warning */}
                  {data.overdue > 0 && (
                    <div className="p-4 rounded-lg bg-red-500/10">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">Overdue Payments</p>
                          <p className="text-sm text-muted-foreground">
                            You have {data.overdue} overdue payments that need attention
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Schedule */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Upcoming Payment Schedule</h4>
                    <div className="space-y-2">
                      {data.paymentSchedule.map((payment, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{payment.description || 'Loan Payment'}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <Badge variant={
                              payment.status === 'Paid' ? 'success' :
                              payment.status === 'Pending' ? 'secondary' : 'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {data.paymentSchedule.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No upcoming payments scheduled
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <LoanList />
        </TabsContent>

        <TabsContent value="calculator">
          <EMICalculator />
        </TabsContent>

        <TabsContent value="timeline">
          <DebtTimeline />
        </TabsContent>
      </Tabs>

      {/* Add Guide Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle>{LOAN_GUIDE.overview.title}</DialogTitle>
            <DialogDescription>
              {LOAN_GUIDE.overview.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Getting Started Section */}
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">{LOAN_GUIDE.overview.sections[0].title}</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {LOAN_GUIDE.overview.sections[0].items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              {LOAN_GUIDE.features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Best Practices Section */}
            <div className="bg-muted/50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold mb-2">{LOAN_GUIDE.overview.sections[2].title}</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {LOAN_GUIDE.overview.sections[2].items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button onClick={() => setShowGuide(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddLoanDialog 
        open={showAddLoan} 
        onOpenChange={setShowAddLoan} 
      />
    </div>
  )
} 