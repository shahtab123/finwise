'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList"
import { analyzeSubscriptions } from "@/lib/services/subscription-analyzer"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalMonthly: 0,
    totalAnnual: 0,
    potentialSavings: 0,
    unusedCount: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    if (isRefreshing) return;

    const storedContent = localStorage.getItem('finwise_latest_statement');
    if (storedContent) {
      try {
        const results = await analyzeSubscriptions(storedContent);
        console.log('Subscription Analysis:', results);
        
        setSubscriptions(results.subscriptions);
        setMetrics({
          totalMonthly: results.totalMonthly,
          totalAnnual: results.totalAnnual,
          potentialSavings: results.potentialSavings,
          unusedCount: results.unusedCount
        });
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      }
    }
  }, [isRefreshing]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await loadSubscriptions();
    setIsRefreshing(false);
  };

  const handleToggleUnused = useCallback((index: number, isUnused: boolean) => {
    setSubscriptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isUnused };
      
      // Update unused count
      const unusedCount = updated.filter(sub => sub.isUnused).length;
      setMetrics(prev => ({ ...prev, unusedCount }));
      
      return updated;
    });
  }, []);

  // Sort subscriptions by amount for distribution chart
  const sortedSubscriptions = [...subscriptions].sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Subscription Manager</h1>
          <p className="text-muted-foreground mt-1">Track and optimize your recurring payments</p>
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
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Total</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.totalMonthly.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">${metrics.totalAnnual.toFixed(2)} annually</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <h3 className="text-2xl font-bold mt-1">{subscriptions.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.potentialSavings.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unused Subscriptions</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.unusedCount}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Subscriptions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Your recurring payments and memberships</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionList 
              subscriptions={subscriptions} 
              onToggleUnused={handleToggleUnused}
            />
          </CardContent>
        </Card>

        {/* Optimization Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Tips</CardTitle>
            <CardDescription>Ways to reduce subscription costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions
                .filter(sub => sub.optimizationTip && sub.potentialSaving > 0)
                .slice(0, 6) // Limit to 6 tips
                .map((sub, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">{sub.optimizationTip}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-emerald-500">
                            Save ${sub.potentialSaving.toFixed(2)}/mo
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {!subscriptions.some(sub => sub.optimizationTip && sub.potentialSaving > 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No optimization tips available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Breakdown of your recurring payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedSubscriptions}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {sortedSubscriptions.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={[
                          '#FF6B6B', '#4ECDC4', '#45B7D1', 
                          '#96CEB4', '#FFEEAD', '#D4A5A5'
                        ][index % 6]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value}`}
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
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Most Expensive</p>
                  <p className="text-lg font-bold">
                    {sortedSubscriptions[0]?.name} (${sortedSubscriptions[0]?.amount.toFixed(2)}/mo)
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Category Split</p>
                  <p className="text-lg font-bold">
                    {subscriptions.length} Services
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 