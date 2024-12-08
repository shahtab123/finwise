'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Briefcase,
  BarChart as BarChartIcon,
  Percent
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InvestmentList } from "@/components/investments/InvestmentList"
import { PortfolioDistribution } from "@/components/investments/PortfolioDistribution"
import { PerformanceChart } from "@/components/investments/PerformanceChart"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

const STORAGE_KEY = 'finwise_investments';
const STORAGE_KEY_METRICS = 'finwise_investment_metrics';
const STORAGE_KEY_INSIGHTS = 'finwise_investment_insights';

const DEFAULT_INVESTMENTS = [
  {
    name: "S&P 500 ETF",
    type: "ETF",
    value: 10000,
    initialValue: 8000,
    return: 25,
    riskLevel: "Medium",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/sp500"
  },
  {
    name: "Tech Growth Fund",
    type: "Mutual Fund",
    value: 5000,
    initialValue: 4000,
    return: 25,
    riskLevel: "High",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/tech"
  },
  {
    name: "Government Bonds",
    type: "Bonds",
    value: 3000,
    initialValue: 3000,
    return: 0,
    riskLevel: "Low",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/bonds"
  }
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    totalReturn: 0,
    returnPercentage: 0,
    riskScore: 0,
    diversificationScore: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    // Load stored data
    const storedInvestments = localStorage.getItem(STORAGE_KEY);
    const storedMetrics = localStorage.getItem(STORAGE_KEY_METRICS);
    const storedInsights = localStorage.getItem(STORAGE_KEY_INSIGHTS);

    if (storedInvestments && storedMetrics && storedInsights) {
      try {
        const parsedInvestments = JSON.parse(storedInvestments);
        const parsedMetrics = JSON.parse(storedMetrics);
        const parsedInsights = JSON.parse(storedInsights);

        // Only set if we have valid data
        if (parsedInvestments.length > 0) {
          setInvestments(parsedInvestments);
          setMetrics(parsedMetrics);
          setInsights(parsedInsights);
        } else {
          // Use default data if stored data is empty
          setInvestments(DEFAULT_INVESTMENTS);
          setMetrics({
            totalValue: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + inv.value, 0),
            totalReturn: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + (inv.value - inv.initialValue), 0),
            returnPercentage: 20,
            riskScore: 6,
            diversificationScore: 8
          });
          setInsights([
            {
              title: "Portfolio Diversification",
              description: "Your portfolio has a good mix of assets across different risk levels.",
              type: "success",
              action: "View Details",
              actionUrl: "#"
            },
            {
              title: "High Growth Potential",
              description: "Tech sector investments showing strong performance.",
              type: "info",
              action: "Analyze Trends",
              actionUrl: "#"
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        // Use default data on error
        setInvestments(DEFAULT_INVESTMENTS);
        setMetrics({
          totalValue: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + inv.value, 0),
          totalReturn: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + (inv.value - inv.initialValue), 0),
          returnPercentage: 20,
          riskScore: 6,
          diversificationScore: 8
        });
        setInsights([
          {
            title: "Portfolio Diversification",
            description: "Your portfolio has a good mix of assets across different risk levels.",
            type: "success",
            action: "View Details",
            actionUrl: "#"
          },
          {
            title: "High Growth Potential",
            description: "Tech sector investments showing strong performance.",
            type: "info",
            action: "Analyze Trends",
            actionUrl: "#"
          }
        ]);
      }
    } else {
      // Use default data if no stored data
      setInvestments(DEFAULT_INVESTMENTS);
      setMetrics({
        totalValue: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + inv.value, 0),
        totalReturn: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + (inv.value - inv.initialValue), 0),
        returnPercentage: 20,
        riskScore: 6,
        diversificationScore: 8
      });
      setInsights([
        {
          title: "Portfolio Diversification",
          description: "Your portfolio has a good mix of assets across different risk levels.",
          type: "success",
          action: "View Details",
          actionUrl: "#"
        },
        {
          title: "High Growth Potential",
          description: "Tech sector investments showing strong performance.",
          type: "info",
          action: "Analyze Trends",
          actionUrl: "#"
        }
      ]);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (investments.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
    }
  }, [investments]);

  useEffect(() => {
    if (metrics.totalValue !== 0) {
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metrics));
    }
  }, [metrics]);

  useEffect(() => {
    if (insights.length > 0) {
      localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights));
    }
  }, [insights]);

  const loadInvestments = useCallback(async () => {
    if (isRefreshing) return;

    // Only load from localStorage, don't analyze bank statements
    const storedInvestments = localStorage.getItem(STORAGE_KEY);
    const storedMetrics = localStorage.getItem(STORAGE_KEY_METRICS);
    const storedInsights = localStorage.getItem(STORAGE_KEY_INSIGHTS);

    if (storedInvestments && storedMetrics && storedInsights) {
      try {
        const parsedInvestments = JSON.parse(storedInvestments);
        const parsedMetrics = JSON.parse(storedMetrics);
        const parsedInsights = JSON.parse(storedInsights);

        setInvestments(parsedInvestments);
        setMetrics(parsedMetrics);
        setInsights(parsedInsights);
      } catch (error) {
        console.error('Error loading stored data:', error);
        // Use default data on error
        setDefaultData();
      }
    } else {
      // Use default data if no stored data
      setDefaultData();
    }
  }, [isRefreshing]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await loadInvestments();
    setIsRefreshing(false);
  };

  const handleSave = () => {
    try {
      // Save all data to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metrics));
      localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights));

      // Show success message (you can add a toast notification here)
      console.log('Portfolio saved successfully');
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const handleAddInvestment = (newInvestment: any) => {
    const updatedInvestments = [...investments, newInvestment];
    
    // Calculate new metrics
    const totalValue = updatedInvestments.reduce((sum, inv) => sum + inv.value, 0);
    const totalReturn = updatedInvestments.reduce((sum, inv) => sum + (inv.value - inv.initialValue), 0);
    const returnPercentage = (totalReturn / totalValue) * 100;

    const newMetrics = {
      ...metrics,
      totalValue,
      totalReturn,
      returnPercentage
    };

    // Update state
    setInvestments(updatedInvestments);
    setMetrics(newMetrics);

    // Store immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvestments));
    localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(newMetrics));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Investment Manager</h1>
          <p className="text-muted-foreground mt-1">Track and optimize your investment portfolio</p>
        </div>
        <div className="flex gap-4">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-6 text-lg font-semibold"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Add New Investment
          </Button>
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
            <Button 
              variant="secondary"
              onClick={handleSave}
              className="px-4"
            >
              Save Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.totalValue.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {metrics.totalReturn >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500">+${metrics.totalReturn.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">-${Math.abs(metrics.totalReturn).toLocaleString()}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                <h3 className="text-2xl font-bold mt-1">
                  <span className={metrics.returnPercentage >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {metrics.returnPercentage >= 0 ? "+" : "-"}
                    {Math.abs(metrics.returnPercentage).toFixed(2)}%
                  </span>
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Percent className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.riskScore}/10</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diversification</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.diversificationScore}/10</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PieChartIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Investment List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Investment Portfolio</CardTitle>
            <CardDescription>Your current investment holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentList investments={investments} />
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Portfolio analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
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
                          onClick={() => window.open(insight.actionUrl, '_blank')}
                        >
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>Portfolio value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={investments} />
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Portfolio diversification</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioDistribution investments={investments} />
          </CardContent>
        </Card>
      </div>

      <AddInvestmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddInvestment={handleAddInvestment}
      />
    </div>
  )
}

function AddInvestmentDialog({ open, onOpenChange, onAddInvestment }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInvestment: (investment: any) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    initialValue: '',
    purchaseDate: '',
    riskLevel: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInvestment({
      ...formData,
      value: parseFloat(formData.value),
      initialValue: parseFloat(formData.initialValue),
      return: ((parseFloat(formData.value) - parseFloat(formData.initialValue)) / parseFloat(formData.initialValue) * 100).toFixed(2),
      lastUpdated: new Date().toISOString().split('T')[0],
      managementUrl: '#'
    });
    onOpenChange(false);
    setFormData({
      name: '',
      type: '',
      value: '',
      initialValue: '',
      purchaseDate: '',
      riskLevel: '',
      notes: ''
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Add New Investment
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Enter the details of your investment below.
            </DialogPrimitive.Description>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Bonds">Bonds</option>
                  <option value="ETF">ETF</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Current Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Initial Value</label>
                <input
                  type="number"
                  value={formData.initialValue}
                  onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Risk Level</label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                >
                  <option value="">Select risk level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Notes</label>
                <input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Investment</Button>
            </div>
          </form>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
} 