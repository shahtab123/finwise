'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  ReferenceLine,
  Rectangle,
  Label,
  Legend
} from 'recharts'
import { 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Smartphone,
  Coffee,
  ShoppingCart,
  Zap,
  DollarSign,
  RefreshCw,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExpensesList } from "@/components/expenses/ExpensesList"
import { analyzeExpenseMetrics } from "@/lib/services/openai"
import { calculateCategorySpending } from "@/lib/services/expense-analyzer"
import { calculateMonthlyTrends } from "@/lib/services/expense-analyzer"
import { getRecentTransactions } from "@/lib/services/expense-analyzer"
import { detectAnomalies } from "@/lib/services/expense-analyzer"

// Add this helper function at the top of the file, after imports
const lightenColor = (hex: string, percent: number) => {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Lighten
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));

  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Custom Bar shape with gradient
const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  return (
    <g>
      <defs>
        <linearGradient id={`colorGradient-${x}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.8} />
          <stop offset="95%" stopColor={fill} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path
        d={`
          M ${x},${y + height}
          L ${x},${y + 8}
          Q ${x},${y} ${x + 8},${y}
          L ${x + width - 8},${y}
          Q ${x + width},${y} ${x + width},${y + 8}
          L ${x + width},${y + height}
          Z
        `}
        fill={`url(#colorGradient-${x})`}
        stroke={fill}
        strokeWidth={1}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={4}
        fill={fill}
        rx={2}
      />
    </g>
  );
};

const anomalies = [
  {
    title: 'Unusual Spending',
    description: 'Grocery spending 40% higher than usual',
    type: 'warning',
    amount: '+$320',
    category: 'Groceries'
  },
  {
    title: 'Potential Savings',
    description: 'Switch to annual subscription to save',
    type: 'success',
    amount: '-$120',
    category: 'Subscriptions'
  },
  {
    title: 'Duplicate Charge',
    description: 'Same amount charged twice by Netflix',
    type: 'error',
    amount: '$15.99',
    category: 'Entertainment'
  }
]

// Update the CustomPieChart component to accept props
const CustomPieChart = ({ data }: { data: any[] }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.gradient[1]} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={60}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
                stroke="none"
                className="hover:opacity-80 transition-opacity duration-300"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <data.icon className="h-4 w-4" style={{ color: data.color }} />
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      ${data.value.toLocaleString()}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
            wrapperStyle={{
              paddingLeft: "20px",
            }}
            formatter={(value: string) => (
              <span className="text-sm text-foreground">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Category Legend Below Chart */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((category) => (
          <div
            key={category.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <category.icon 
                className="h-4 w-4"
                style={{ color: category.color }}
              />
            </div>
            <div>
              <div className="font-medium text-foreground">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                ${category.value.toLocaleString()}
              </div>
            </div>
            <div className="ml-auto text-sm font-medium text-foreground">
              {category.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    currentBalance: 0,
    monthlySpending: 0,
    averageDaily: 0,
    hasMultipleStatements: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const loadMetrics = useCallback(async () => {
    if (isRefreshing) return;

    const storedContent = localStorage.getItem('finwise_latest_statement');
    if (storedContent) {
      try {
        // Get all the data
        const [metrics, categoryResults, trends, transactions, detectedAnomalies] = await Promise.all([
          analyzeExpenseMetrics(storedContent),
          calculateCategorySpending(storedContent),
          calculateMonthlyTrends(storedContent),
          getRecentTransactions(storedContent),
          detectAnomalies(storedContent)
        ]);

        console.log('Category Results:', categoryResults);
        setMetrics(metrics);
        
        // Format categories for pie chart
        if (categoryResults.categories && categoryResults.categories.length > 0) {
          const formattedCategories = categoryResults.categories.map((cat: any) => {
            const color = getCategoryColor(cat.name);
            return {
              name: cat.name,
              value: cat.value,
              percentage: cat.percentage,
              icon: getCategoryIcon(cat.name),
              color: color,
              gradient: [color, lightenColor(color, 20)]
            };
          });

          console.log('Formatted Categories:', formattedCategories);
          setCategoryData(formattedCategories);
        } else {
          setCategoryData([]);
        }

        setMonthlyTrends(trends);
        setRecentTransactions(transactions);
        setAnomalies(detectedAnomalies);
      } catch (error) {
        console.error('Error loading data:', error);
        setCategoryData([]);
      }
    }
  }, [isRefreshing]);

  useEffect(() => {
    // Initial load
    loadMetrics();

    // Event listener for updates
    const handleTransactionsUpdate = () => {
      if (!isRefreshing) {
        loadMetrics();
      }
    };

    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, [loadMetrics, isRefreshing]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await loadMetrics();
    setIsRefreshing(false);
  };

  // Helper function to get icon for category
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Grocery': ShoppingCart,
      'Subscription': Smartphone,
      'Bills': Zap,
      'Entertainment': Coffee,
      'Shopping': ShoppingBag,
      'Rent': Home,
      'Insurance': ShieldCheck,
      'Transfer': RefreshCw,
      'ATM Withdrawal': DollarSign,
      // Add any other categories that appear in your data
    };
    return icons[category] || DollarSign;
  };

  // Helper function to get color for category
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Grocery': '#FF6B6B',
      'Subscription': '#4ECDC4',
      'Bills': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Shopping': '#FFEEAD',
      'Rent': '#D4A5A5',
      'Insurance': '#FFB6B9',
      'Transfer': '#8785A2',
      'ATM Withdrawal': '#98DFEA',
      // Add any other categories that appear in your data
    };
    return colors[category] || '#808080';
  };

  // Helper function to get gradient for category
  const getCategoryGradient = (category: string) => {
    const color = getCategoryColor(category);
    return [color, lightenColor(color, 20)]; // You'll need to implement lightenColor
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and analyze your spending</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            className={cn(
              "transition-all",
              isRefreshing && "animate-spin"
            )}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Current Balance Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.currentBalance.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            {metrics.hasMultipleStatements && (
              <div className="mt-4 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500">+2.5% from last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Spending</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.monthlySpending.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Daily</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.averageDaily.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <h3 className="text-2xl font-bold mt-1">Groceries</h3>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                26% of total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Distribution of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <CustomPieChart data={categoryData} />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends - Updated */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Spending analysis with historical comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrends && monthlyTrends.length > 0 ? (
              <>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="hsl(var(--muted-foreground))" 
                        opacity={0.1} 
                      />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`$${value}`, 'Spending']}
                      />
                      <Bar
                        dataKey="amount"
                        shape={<CustomBar />}
                        maxBarSize={50}
                      >
                        {monthlyTrends.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 bg-muted/50 rounded-lg p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">
                      ${monthlyTrends[0].amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className="text-2xl font-bold">N/A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">
                      ${monthlyTrends[0].amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomalies and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Anomalies Detected</CardTitle>
            <CardDescription>Unusual spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalies.length > 0 ? (
                anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg",
                      anomaly.type === 'warning' && "bg-yellow-500/10",
                      anomaly.type === 'success' && "bg-emerald-500/10",
                      anomaly.type === 'error' && "bg-red-500/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <AlertCircle className={cn(
                        "h-5 w-5",
                        anomaly.type === 'warning' && "text-yellow-500",
                        anomaly.type === 'success' && "text-emerald-500",
                        anomaly.type === 'error' && "text-red-500"
                      )} />
                      <div className="flex-1">
                        <p className="font-medium">{anomaly.title}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{anomaly.amount}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.category}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No anomalies detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => {
                const Icon = getCategoryIcon(transaction.category);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${getCategoryColor(transaction.category)}20`,
                          color: getCategoryColor(transaction.category)
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "font-medium",
                      transaction.amount < 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 