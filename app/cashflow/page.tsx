'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Download,
  TrendingUp,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  Plus,
  HelpCircle,
  Edit2,
  Trash2
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import { CashFlowTimeline } from "@/components/cashflow/Timeline"
import { CashBalanceGauge } from "@/components/cashflow/Gauge"
import { ScenarioPanel } from "@/components/cashflow/ScenarioPanel"
import { generateCashFlowData, CashFlowData, Scenario } from "@/lib/services/cashflow-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const GUIDE_STEPS = [
  {
    title: "Adding Transactions",
    description: "Click 'Add Transaction' to input expected income or expenses. You can specify if it's a one-time or recurring transaction.",
    icon: Plus
  },
  {
    title: "Scenario Planning",
    description: "Use the scenario panel to switch between Baseline, Optimistic (+10%), and Pessimistic (-10%) projections.",
    icon: TrendingUp
  },
  {
    title: "Timeframe Adjustment",
    description: "Adjust the forecast period from 3 to 24 months using the slider. Longer periods show more trends.",
    icon: Calendar
  },
  {
    title: "Reading Charts",
    description: "The timeline shows expected cash flows, while the waterfall chart displays cumulative position. The gauge shows current vs projected balance.",
    icon: BarChart
  },
  {
    title: "Alerts & Insights",
    description: "System automatically warns about negative cash flow periods, low balance warnings, and highlights positive trends.",
    icon: AlertCircle
  }
];

// Add this helper function
const calculateGrowthRate = (timelineData: any[]) => {
  if (timelineData.length < 2) return 0;
  
  // Get first and last month's data
  const firstMonth = timelineData[0];
  const lastMonth = timelineData[timelineData.length - 1];
  
  // Calculate net cash flow for first and last month
  const firstMonthNet = firstMonth.inflows - firstMonth.outflows;
  const lastMonthNet = lastMonth.inflows - lastMonth.outflows;
  
  // Avoid division by zero
  if (firstMonthNet === 0) return lastMonthNet > 0 ? 100 : 0;
  
  // Calculate growth rate
  const growthRate = ((lastMonthNet - firstMonthNet) / Math.abs(firstMonthNet)) * 100;
  
  // Round to 2 decimal places
  return Math.round(growthRate * 100) / 100;
};

// Add this function after calculateGrowthRate
const generateAlerts = (timelineData: any[], waterfallData: any[]) => {
  const alerts = [];

  // Check for negative balance
  const negativeMonths = timelineData.filter(month => month.balance < 0);
  if (negativeMonths.length > 0) {
    alerts.push({
      type: 'danger',
      title: 'Negative Cash Flow Detected',
      description: `${negativeMonths.length} month(s) show negative cash flow. Consider reducing expenses or increasing revenue.`
    });
  }

  // Check for declining trend
  const lastThreeMonths = timelineData.slice(-3);
  const isDecreasing = lastThreeMonths.every((month, i) => 
    i === 0 || month.balance < lastThreeMonths[i - 1].balance
  );
  if (isDecreasing && lastThreeMonths.length === 3) {
    alerts.push({
      type: 'warning',
      title: 'Declining Cash Flow Trend',
      description: 'Cash flow has been decreasing for the last 3 months. Review your financial strategy.'
    });
  }

  // Check for low cash balance
  const latestBalance = waterfallData[waterfallData.length - 1]?.cumulative || 0;
  if (latestBalance < 10000) {
    alerts.push({
      type: 'warning',
      title: 'Low Cash Balance',
      description: 'Projected cash balance is below recommended minimum. Consider ways to increase cash reserves.'
    });
  }

  // Add positive alerts
  if (latestBalance > 0 && !isDecreasing) {
    alerts.push({
      type: 'info',
      title: 'Positive Cash Position',
      description: 'Your projected cash position remains positive throughout the forecast period.'
    });
  }

  return alerts;
};

// Update the generatePDF function to accept data as a parameter
const generatePDF = async (reportData: CashFlowData, transactions: any[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  
  // Add title
  pdf.setFontSize(20);
  pdf.text('Cash Flow Forecast Report', pageWidth / 2, 15, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(`${new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}`, pageWidth / 2, 22, { align: 'center' });

  // Add summary section
  pdf.setFontSize(14);
  pdf.text('Summary', 14, 35);
  
  const summaryData = [
    ['Current Balance', `$${reportData.currentBalance.toLocaleString()}`],
    ['Projected Balance', `$${reportData.projectedBalance.toLocaleString()}`],
    ['Total Inflows', `$${reportData.totalInflows.toLocaleString()}`],
    ['Total Outflows', `$${reportData.totalOutflows.toLocaleString()}`],
    ['Growth Rate', `${reportData.growthRate.toFixed(2)}%`]
  ];

  autoTable(pdf, {
    startY: 40,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [76, 205, 196] }
  });

  // Add transactions section
  pdf.setFontSize(14);
  pdf.text('Transactions', 14, pdf.lastAutoTable.finalY + 15);

  const transactionsData = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type === 'inflow' ? 'Income' : 'Expense',
    t.description,
    t.category,
    `$${t.amount.toLocaleString()}`,
    t.isRecurring ? t.frequency : 'One-time'
  ]);

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 20,
    head: [['Date', 'Type', 'Description', 'Category', 'Amount', 'Frequency']],
    body: transactionsData,
    theme: 'grid',
    headStyles: { fillColor: [76, 205, 196] }
  });

  // Capture and add charts
  const chartsContainer = document.getElementById('charts-container');
  if (chartsContainer) {
    const canvas = await html2canvas(chartsContainer);
    const imgData = canvas.toDataURL('image/png');
    
    // Add new page for charts
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text('Charts & Analytics', 14, 15);
    
    const imgWidth = pageWidth - 28; // 14mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 14, 25, imgWidth, imgHeight);
  }

  // Add alerts section
  if (reportData.alerts.length > 0) {
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text('Cash Flow Alerts', 14, 15);
    
    const alertsData = reportData.alerts.map(alert => [
      alert.type.toUpperCase(),
      alert.title,
      alert.description
    ]);

    autoTable(pdf, {
      startY: 20,
      head: [['Type', 'Title', 'Description']],
      body: alertsData,
      theme: 'grid',
      headStyles: { fillColor: [76, 205, 196] }
    });
  }

  // Save the PDF
  pdf.save(`cashflow-forecast-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Add these categories at the top with other constants
const TRANSACTION_CATEGORIES = {
  inflow: [
    'Sales',
    'Consulting',
    'Investments',
    'Bonus',
    'Interest Income',
    'Other Income'
  ],
  outflow: [
    'Salary',
    'Marketing',
    'Operations',
    'Office Rent',
    'Utilities',
    'Taxes',
    'Insurance',
    'Maintenance',
    'Software',
    'Travel',
    'Other Expenses'
  ]
};

export default function CashFlowPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('baseline');
  const [timeframe, setTimeframe] = useState<number>(12); // months
  const [data, setData] = useState<CashFlowData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
  const [transactions, setTransactions] = useState<{
    date: string;
    type: 'inflow' | 'outflow';
    amount: number;
    description: string;
    category: string;
    isRecurring: boolean;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
  }[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [transactionType, setTransactionType] = useState<'inflow' | 'outflow'>('inflow');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    const multiplier = selectedScenario === 'optimistic' ? 1.1 : 
                      selectedScenario === 'pessimistic' ? 0.9 : 1;

    // Generate dates for the selected timeframe
    const dates = [];
    const currentDate = new Date();
    for (let i = 0; i < timeframe; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      dates.push(date.toISOString().split('T')[0].substring(0, 7)); // YYYY-MM format
    }

    // Initialize timeline data for all months
    const timelineData = dates.map(monthYear => ({
      date: new Date(monthYear).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
      inflows: 0,
      outflows: 0,
      balance: 0,
      events: []
    }));

    // Process transactions
    transactions.forEach(transaction => {
      const transactionMonth = transaction.date.substring(0, 7); // YYYY-MM
      const monthIndex = dates.indexOf(transactionMonth);
      
      if (monthIndex >= 0) {
        const dayEntry = timelineData[monthIndex];
        const adjustedAmount = transaction.type === 'inflow' 
          ? transaction.amount * multiplier 
          : transaction.amount;

        if (transaction.type === 'inflow') {
          dayEntry.inflows += adjustedAmount;
        } else {
          dayEntry.outflows += adjustedAmount;
        }
        dayEntry.balance = dayEntry.inflows - dayEntry.outflows;

        dayEntry.events.push({
          date: transaction.date,
          amount: adjustedAmount,
          type: transaction.type,
          description: transaction.description,
          category: transaction.category
        });
      }
    });

    // Calculate running totals and generate waterfall data
    const waterfallData = timelineData.map((day, index) => {
      const previousTotal = index > 0 ? timelineData[index - 1].balance : 0;
      return {
        name: day.date,
        inflow: day.inflows,
        outflow: day.outflows,
        balance: day.balance,
        cumulative: previousTotal + day.balance
      };
    });

    // Update the cash flow data
    setData({
      currentBalance: transactions.reduce((total, t) => 
        total + (t.type === 'inflow' ? t.amount : -t.amount), 0),
      projectedBalance: waterfallData[waterfallData.length - 1]?.cumulative || 0,
      minimumRequired: 25000,
      totalInflows: transactions.reduce((total, t) => 
        total + (t.type === 'inflow' ? t.amount : 0), 0),
      totalOutflows: transactions.reduce((total, t) => 
        total + (t.type === 'outflow' ? t.amount : 0), 0),
      growthRate: calculateGrowthRate(timelineData),
      timeline: timelineData,
      waterfall: waterfallData,
      alerts: generateAlerts(timelineData, waterfallData)
    });
  }, [transactions, timeframe, selectedScenario]);

  useEffect(() => {
    // Load saved transactions on mount
    const savedTransactions = localStorage.getItem('finwise_cashflow_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []); // Run only on mount

  // Save transactions whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('finwise_cashflow_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction = {
      date,
      type: transactionType,
      amount,
      description,
      category: category || (transactionType === 'inflow' ? 'Other Income' : 'Other Expenses'),
      isRecurring,
      frequency: isRecurring ? frequency : undefined
    };

    setTransactions(prev => [...prev, newTransaction]);
    localStorage.setItem('finwise_cashflow_transactions', 
      JSON.stringify([...transactions, newTransaction])
    );

    // Reset form
    setTransactionType('inflow');
    setAmount(0);
    setDate('');
    setDescription('');
    setCategory('');
    setIsRecurring(false);
    setFrequency('monthly');
    setShowAddTransactionDialog(false);

    // Recalculate cash flow data
    const cashFlowData = generateCashFlowData(timeframe, selectedScenario);
    setData(cashFlowData);
  };

  const handleResetData = () => {
    setTransactions([]);
    localStorage.removeItem('finwise_cashflow_transactions');
    setSelectedScenario('baseline');
    setTimeframe(12);
    setIsSimulating(false);
  };

  const loadTestData = () => {
    const testTransactions = [];
    const currentDate = new Date();
    
    // Generate data for 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      
      // Monthly recurring transactions
      testTransactions.push({
        date: date.toISOString().split('T')[0],
        type: 'inflow' as const,
        amount: 50000 + Math.random() * 10000, // Random variation in revenue
        description: 'Monthly Revenue',
        category: 'Sales',
        isRecurring: true,
        frequency: 'monthly' as const
      });

      testTransactions.push({
        date: date.toISOString().split('T')[0],
        type: 'outflow' as const,
        amount: 15000 + Math.random() * 2000, // Random variation in payroll
        description: 'Payroll',
        category: 'Salary',
        isRecurring: true,
        frequency: 'monthly' as const
      });

      testTransactions.push({
        date: date.toISOString().split('T')[0],
        type: 'outflow' as const,
        amount: 8000,
        description: 'Office Rent',
        category: 'Facilities',
        isRecurring: true,
        frequency: 'monthly' as const
      });

      // Quarterly transactions
      if (i % 3 === 0) {
        testTransactions.push({
          date: date.toISOString().split('T')[0],
          type: 'outflow' as const,
          amount: 15000,
          description: 'Quarterly Taxes',
          category: 'Taxes',
          isRecurring: true,
          frequency: 'quarterly' as const
        });

        testTransactions.push({
          date: date.toISOString().split('T')[0],
          type: 'inflow' as const,
          amount: 30000,
          description: 'Quarterly Bonus',
          category: 'Bonus',
          isRecurring: true,
          frequency: 'quarterly' as const
        });
      }

      // Random one-time transactions
      if (Math.random() > 0.5) {
        testTransactions.push({
          date: date.toISOString().split('T')[0],
          type: 'outflow' as const,
          amount: 5000 + Math.random() * 5000,
          description: 'Marketing Campaign',
          category: 'Marketing',
          isRecurring: false
        });
      }

      if (Math.random() > 0.7) {
        testTransactions.push({
          date: date.toISOString().split('T')[0],
          type: 'inflow' as const,
          amount: 20000 + Math.random() * 10000,
          description: 'Project Payment',
          category: 'Consulting',
          isRecurring: false
        });
      }
    }

    setTransactions(testTransactions);
    localStorage.setItem('finwise_cashflow_transactions', JSON.stringify(testTransactions));
  };

  if (!data) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Cash Flow Forecast</h1>
          <p className="text-muted-foreground mt-1">Project and analyze your future cash flows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGuide(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Guide
          </Button>
          <Button onClick={() => setShowAddTransactionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
          <Button onClick={() => setIsSimulating(!isSimulating)}>
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
          <Button onClick={() => data && generatePDF(data, transactions)}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="destructive" onClick={handleResetData}>
            Reset Data
          </Button>
          <Button variant="secondary" onClick={loadTestData}>
            Load Test Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Balance</p>
                <h3 className="text-2xl font-bold mt-1">${data.projectedBalance.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">+{data.growthRate}% projected growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inflows</p>
                <h3 className="text-2xl font-bold mt-1">${data.totalInflows.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outflows</p>
                <h3 className="text-2xl font-bold mt-1">${data.totalOutflows.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forecast Period</p>
                <h3 className="text-2xl font-bold mt-1">{timeframe} Months</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription>View and manage your cash flow entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No transactions added yet. Click "Add Transaction" to get started.
              </div>
            ) : (
              <div className="rounded-md border max-h-[400px] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Frequency</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Badge variant={transaction.type === 'inflow' ? 'success' : 'destructive'}>
                            {transaction.type === 'inflow' ? 'Income' : 'Expense'}
                          </Badge>
                        </td>
                        <td className="p-3">{transaction.description}</td>
                        <td className="p-3 text-right font-medium">
                          <span className={transaction.type === 'inflow' ? 'text-emerald-500' : 'text-red-500'}>
                            {transaction.type === 'inflow' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">{transaction.category}</td>
                        <td className="p-3">
                          {transaction.isRecurring ? (
                            <Badge variant="outline">{transaction.frequency}</Badge>
                          ) : (
                            <span className="text-muted-foreground">One-time</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                // Pre-fill form with transaction data
                                setTransactionType(transaction.type);
                                setAmount(transaction.amount);
                                setDate(transaction.date);
                                setDescription(transaction.description);
                                setIsRecurring(transaction.isRecurring);
                                if (transaction.frequency) {
                                  setFrequency(transaction.frequency);
                                }
                                setShowAddTransactionDialog(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                // Remove transaction
                                setTransactions(transactions.filter((_, i) => i !== index));
                                // Update cash flow data
                                const cashFlowData = generateCashFlowData(timeframe, selectedScenario);
                                setData(cashFlowData);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column - Charts */}
        <div className="md:col-span-9 space-y-6" id="charts-container">
          {/* Cash Flow Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Timeline</CardTitle>
              <CardDescription>Detailed view of cash movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="inflows" 
                      name="Inflows" 
                      fill="#4ade80" 
                      opacity={0.8}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="outflows" 
                      name="Outflows" 
                      fill="#f87171" 
                      opacity={0.8}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="balance" 
                      name="Net Balance" 
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Waterfall Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Cash Flow</CardTitle>
              <CardDescription>Net cash position over the forecast period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.waterfall}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inflow" stackId="a" fill="#4ade80" />
                    <Bar dataKey="outflow" stackId="a" fill="#f87171" />
                    <Line type="monotone" dataKey="balance" stroke="#60a5fa" />
                    <Area type="monotone" dataKey="cumulative" fill="#93c5fd" stroke="#3b82f6" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Balance Gauge */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Balance Overview</CardTitle>
              <CardDescription>Current and projected cash reserves</CardDescription>
            </CardHeader>
            <CardContent>
              <CashBalanceGauge 
                current={data.currentBalance} 
                projected={data.projectedBalance}
                minimum={data.minimumRequired}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Scenario Panel */}
        <div className="md:col-span-3">
          <ScenarioPanel
            scenario={selectedScenario}
            onScenarioChange={setSelectedScenario}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isSimulating={isSimulating}
          />
        </div>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Alerts</CardTitle>
          <CardDescription>Important notifications about your cash flow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg",
                  alert.type === 'warning' && "bg-yellow-500/10",
                  alert.type === 'danger' && "bg-red-500/10",
                  alert.type === 'info' && "bg-blue-500/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <AlertCircle className={cn(
                    "h-5 w-5",
                    alert.type === 'warning' && "text-yellow-500",
                    alert.type === 'danger' && "text-red-500",
                    alert.type === 'info' && "text-blue-500"
                  )} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Add expected income or expenses to your cash flow forecast
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Type</label>
                <select
                  className="col-span-3"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as 'inflow' | 'outflow')}
                >
                  <option value="inflow">Income</option>
                  <option value="outflow">Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Category</label>
                <select
                  className="col-span-3"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {TRANSACTION_CATEGORIES[transactionType].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Amount</label>
                <input
                  type="number"
                  className="col-span-3"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Date</label>
                <input
                  type="date"
                  className="col-span-3"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Description</label>
                <input
                  className="col-span-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Recurring?</label>
                <div className="col-span-3 flex items-center gap-4">
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  {isRecurring && (
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cash Flow Forecast Guide</DialogTitle>
            <DialogDescription>
              Learn how to use the cash flow forecasting tool effectively
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {GUIDE_STEPS.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGuide(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 