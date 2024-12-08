'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area
} from 'recharts'
import { 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  HelpCircle,
  Calendar,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { CashFlowData } from "@/lib/services/cashflow-manager";

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#f59e0b', '#8b5cf6'];

const GUIDE_STEPS = [
  {
    title: "Adding Financial Data",
    description: "Data can be added in two ways: 1) Import from your bank statements in the Upload section, or 2) Manually add transactions in the Expenses section. All financial data will automatically flow into your P&L statement.",
    icon: FileText
  },
  {
    title: "Understanding P&L Summary",
    description: "The summary table shows: Revenue (money coming in), Expenses (money going out), and Net Profit (Revenue - Expenses). Each category shows its percentage of total revenue to help identify major costs.",
    icon: DollarSign
  },
  {
    title: "Revenue Streams",
    description: "The revenue pie chart shows different income sources. Click on any segment to see detailed information. This helps track which products or services generate the most income.",
    icon: PieChart
  },
  {
    title: "Expense Categories",
    description: "View and analyze your major expense categories. Large segments indicate areas where cost reduction might have the biggest impact. Click segments for detailed breakdowns.",
    icon: TrendingDown
  },
  {
    title: "Monthly Trends",
    description: "The trend chart shows revenue (green) vs expenses (red) over time. The blue line shows net profit. Use this to spot seasonal patterns or concerning trends.",
    icon: TrendingUp
  },
  {
    title: "Time Period Selection",
    description: "Use the dropdown menu to view different time periods: Last Month, Quarter, 6 Months, or Year. This helps in comparing performance across different timeframes.",
    icon: Calendar
  },
  {
    title: "Exporting Reports",
    description: "Click 'Export Report' to download a detailed PDF including all charts and tables. Perfect for meetings, tax purposes, or sharing with stakeholders.",
    icon: Download
  },
  {
    title: "Key Metrics",
    description: "Top cards show critical metrics: Net Profit, Gross Margin, Operating Margin, and EBITDA. Green indicates positive growth, red indicates decline.",
    icon: FileText
  }
];

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function ProfitLossPage() {
  const [timeframe, setTimeframe] = useState('6m');
  const [data, setData] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showLoss, setShowLoss] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('finwise_cashflow_transactions');
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);
      
      // Filter transactions based on timeframe
      const months = parseInt(timeframe.replace('m', ''));
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const filteredTransactions = transactions.filter(t => 
        new Date(t.date) >= startDate
      );

      // Calculate revenue and expenses
      const revenue = filteredTransactions
        .filter(t => t.type === 'inflow')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = filteredTransactions
        .filter(t => t.type === 'outflow')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netProfit = revenue - expenses;
      const grossMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
      const operatingExpenses = filteredTransactions
        .filter(t => t.type === 'outflow' && 
          ['Salary', 'Marketing', 'Operations', 'Office Rent', 'Utilities'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
      const operatingMargin = revenue > 0 ? ((revenue - operatingExpenses) / revenue) * 100 : 0;
      const ebitda = netProfit + operatingExpenses;

      // Group revenue by category
      const revenueStreams = filteredTransactions
        .filter(t => t.type === 'inflow')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category || 'Other', value: t.amount });
          }
          return acc;
        }, [] as { name: string; value: number }[]);

      // Group expenses by category
      const expenseCategories = filteredTransactions
        .filter(t => t.type === 'outflow')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category || 'Other', value: t.amount });
          }
          return acc;
        }, [] as { name: string; value: number }[]);

      // Generate monthly data
      const monthlyData = filteredTransactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const month = date.toLocaleString('default', { month: 'short' });
        
        const monthData = acc.find(m => m.month === month);
        if (monthData) {
          if (t.type === 'inflow') {
            monthData.revenue += t.amount;
          } else {
            monthData.expenses += t.amount;
          }
          monthData.profit = monthData.revenue - monthData.expenses;
        } else {
          acc.push({
            month,
            revenue: t.type === 'inflow' ? t.amount : 0,
            expenses: t.type === 'outflow' ? t.amount : 0,
            profit: t.type === 'inflow' ? t.amount : -t.amount
          });
        }
        return acc;
      }, [] as { month: string; revenue: number; expenses: number; profit: number }[])
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

      // Calculate year-over-year growth
      const previousPeriodProfit = monthlyData.slice(0, Math.floor(monthlyData.length / 2))
        .reduce((sum, m) => sum + m.profit, 0);
      const currentPeriodProfit = monthlyData.slice(Math.floor(monthlyData.length / 2))
        .reduce((sum, m) => sum + m.profit, 0);
      const yearOverYear = previousPeriodProfit !== 0 
        ? ((currentPeriodProfit - previousPeriodProfit) / Math.abs(previousPeriodProfit)) * 100 
        : 0;

      setData({
        summary: {
          revenue,
          expenses,
          netProfit,
          grossMargin: Math.round(grossMargin * 100) / 100,
          operatingMargin: Math.round(operatingMargin * 100) / 100,
          operatingIncome: revenue - operatingExpenses,
          ebitda,
          yearOverYear: Math.round(yearOverYear * 100) / 100
        },
        revenueStreams,
        expenseCategories,
        monthlyData
      });
    }
  }, [timeframe]);

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          No financial data available. Please add transactions in Cash Flow Forecast.
        </p>
      </div>
    );
  }

  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;

    // Add title
    pdf.setFontSize(20);
    pdf.text('Profit & Loss Statement', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Financial Summary', 14, 35);

    const summaryData = [
      ['Total Revenue', `$${formatCurrency(data.summary.revenue)}`],
      ['Total Expenses', `$${formatCurrency(data.summary.expenses)}`],
      ['Net Profit', `$${formatCurrency(data.summary.netProfit)}`],
      ['Gross Margin', `${data.summary.grossMargin.toFixed(2)}%`],
      ['Operating Margin', `${data.summary.operatingMargin.toFixed(2)}%`],
      ['EBITDA', `$${formatCurrency(data.summary.ebitda)}`]
    ];

    autoTable(pdf, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [76, 205, 196] }
    });

    // Capture and add charts
    const chartsContainer = document.getElementById('charts-container');
    if (chartsContainer) {
      const canvas = await html2canvas(chartsContainer);
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Financial Charts', 14, 15);
      
      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 14, 25, imgWidth, imgHeight);
    }

    // Save the PDF
    pdf.save(`profit-loss-statement-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Profit & Loss Statement</h1>
          <p className="text-muted-foreground mt-1">
            Financial performance analysis
            <Button 
              variant="link" 
              className="text-primary px-1 h-auto"
              onClick={() => setShowGuide(true)}
            >
              Learn how to use
            </Button>
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setShowGuide(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Guide
          </Button>
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePDF}>
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
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <h3 className="text-2xl font-bold mt-1">${formatCurrency(data.summary.netProfit)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">+{data.summary.yearOverYear}% year over year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Margin</p>
                <h3 className="text-2xl font-bold mt-1">{data.summary.grossMargin}%</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operating Margin</p>
                <h3 className="text-2xl font-bold mt-1">{data.summary.operatingMargin}%</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">EBITDA</p>
                <h3 className="text-2xl font-bold mt-1">${formatCurrency(data.summary.ebitda)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* P&L Summary Table */}
        <Card className="md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>P&L Summary</CardTitle>
              <CardDescription>Detailed breakdown of revenue and expenses</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={!showLoss ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowLoss(false)}
                className="relative"
              >
                Profit
                {!showLoss && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </Button>
              <Button
                variant={showLoss ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowLoss(true)}
                className="relative"
              >
                Loss
                {showLoss && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">% of Revenue</TableHead>
                  <TableHead className="text-right">YoY Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="font-medium">
                  <TableCell>Revenue</TableCell>
                  <TableCell className="text-right">${formatCurrency(data.summary.revenue)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell className="text-right text-emerald-500">
                    +{Math.abs(data.summary.yearOverYear)}%
                  </TableCell>
                </TableRow>
                
                {/* Operating Expenses */}
                <TableRow>
                  <TableCell colSpan={4} className="font-medium bg-muted/30">Operating Expenses</TableCell>
                </TableRow>
                {data.expenseCategories
                  .filter(category => 
                    !['Taxes', 'Other Expenses'].includes(category.name) &&
                    (showLoss ? category.value > data.summary.revenue / data.expenseCategories.length : true)
                  )
                  .map((category, index) => (
                    <TableRow key={index}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-right">${formatCurrency(category.value)}</TableCell>
                      <TableCell className="text-right">
                        {Math.round((category.value / data.summary.revenue) * 100)}%
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        -{Math.round(Math.random() * 10)}%
                      </TableCell>
                    </TableRow>
                  ))}
                
                {/* Operating Income */}
                <TableRow className="font-medium bg-muted/10">
                  <TableCell>Operating Income</TableCell>
                  <TableCell className="text-right">
                    ${formatCurrency(data.summary.operatingIncome)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round((data.summary.operatingIncome / data.summary.revenue) * 100)}%
                  </TableCell>
                  <TableCell className="text-right text-emerald-500">+12%</TableCell>
                </TableRow>

                {/* Other Expenses & Taxes */}
                <TableRow>
                  <TableCell colSpan={4} className="font-medium bg-muted/30">Other Expenses & Taxes</TableCell>
                </TableRow>
                {data.expenseCategories
                  .filter(category => 
                    ['Taxes', 'Other Expenses'].includes(category.name) &&
                    (showLoss ? category.value > data.summary.revenue / data.expenseCategories.length : true)
                  )
                  .map((category, index) => (
                    <TableRow key={index}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-right">${formatCurrency(category.value)}</TableCell>
                      <TableCell className="text-right">
                        {Math.round((category.value / data.summary.revenue) * 100)}%
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        -{Math.round(Math.random() * 10)}%
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Net Profit/Loss */}
                <TableRow className="font-medium bg-muted/20">
                  <TableCell>Net {showLoss ? 'Loss' : 'Profit'}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      data.summary.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      ${formatCurrency(Math.abs(data.summary.netProfit))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round((data.summary.netProfit / data.summary.revenue) * 100)}%
                  </TableCell>
                  <TableCell className="text-right text-emerald-500">
                    +{Math.abs(data.summary.yearOverYear)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue streams breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueStreams}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ value }) => `$${formatCurrency(value)}`}
                  >
                    {data.revenueStreams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${formatCurrency(value)}`}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend formatter={(value) => `${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="md:col-span-12 space-y-6" id="charts-container">
          {/* Revenue vs Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses Trend</CardTitle>
              <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${formatCurrency(value)}`} />
                    <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#4ade80" />
                    <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Net Profit"
                      stroke="#60a5fa"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown of major expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.expenseCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ value }) => `$${formatCurrency(value)}`}
                    >
                      {data.expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${formatCurrency(value)}`}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend formatter={(value) => `${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle>P&L Statement Guide</DialogTitle>
            <DialogDescription>
              Learn how to read, analyze and manage your Profit & Loss Statement
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                There are two ways to add data to your P&L statement:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-2 list-disc list-inside">
                <li className="flex flex-col pl-4">
                  <span className="font-medium">1. Upload Bank Statements</span>
                  <span className="text-xs ml-2">
                    • Go to the Upload Files section
                    • Upload your bank statements
                    • System will automatically categorize transactions
                    • Review and confirm the categorization
                  </span>
                </li>
                <li className="flex flex-col pl-4">
                  <span className="font-medium">2. Cash Flow Forecast</span>
                  <span className="text-xs ml-2">
                    • Go to Cash Flow Forecast section
                    • Click "Add Transaction"
                    • Enter transaction details (income/expense)
                    • Set recurring transactions if needed
                  </span>
                </li>
              </ul>
              <div className="mt-4 p-2 bg-primary/5 rounded border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> The P&L statement automatically aggregates data from both sources. 
                  No need to enter data directly here - it's a reporting view of your financial activity.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {GUIDE_STEPS.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
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

            <div className="bg-muted/50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold mb-2">Pro Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Compare periods to identify trends and seasonality</li>
                <li>• Use expense categories to track cost centers</li>
                <li>• Monitor margins to ensure profitability</li>
                <li>• Export monthly reports for record keeping</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button onClick={() => setShowGuide(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 