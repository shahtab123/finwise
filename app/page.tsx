'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  AlertCircle,
  FileText,
  TrendingUp,
  Wallet,
  Calendar,
  PiggyBank,
  Sparkles,
  LucideIcon,
  Repeat
} from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/Charts"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ActivityItem {
  name: string;
  category: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface SubscriptionAlert {
  title: string;
  description: string;
  color: string;
}

interface DashboardData {
  totalBalance: number;
  monthlyBalance: number;
  activeInvestments: number;
  recentActivity: ActivityItem[];
  subscriptionAlerts: SubscriptionAlert[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0,
    monthlyBalance: 0,
    activeInvestments: 0,
    recentActivity: [],
    subscriptionAlerts: []
  });

  useEffect(() => {
    // Load data from localStorage
    const documents = JSON.parse(localStorage.getItem('finwise_documents') || '[]');
    const transactions = JSON.parse(localStorage.getItem('finwise_transactions') || '[]');
    const subscriptions = JSON.parse(localStorage.getItem('finwise_subscriptions') || '[]');

    // Calculate total balance from uploaded documents
    const totalBalance = documents
      .filter((doc: any) => doc.status === 'processed')
      .reduce((sum: number, doc: any) => sum + doc.amount, 0);

    // Get monthly balance from transactions
    const monthlyBalance = transactions
      .filter((t: any) => new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Get recent activity from transactions
    const recentActivity: ActivityItem[] = transactions
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((t: any) => ({
        name: t.description,
        category: t.category,
        amount: t.amount,
        icon: Receipt,
        color: t.amount < 0 ? 'text-red-500' : 'text-emerald-500',
        bgColor: t.amount < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
      }));

    // Get subscription alerts
    const subscriptionAlerts: SubscriptionAlert[] = subscriptions
      .filter((s: any) => s.optimizationTip)
      .slice(0, 3)
      .map((s: any) => ({
        title: s.name,
        description: s.optimizationTip,
        color: 'yellow'
      }));

    setData({
      totalBalance,
      monthlyBalance,
      activeInvestments: 78000, // This could come from investments module
      recentActivity,
      subscriptionAlerts
    });
  }, []);

  const generateReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Financial Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 14, 35);
    
    const summaryData = [
      ['Total Balance', `$${data.totalBalance.toLocaleString()}`],
      ['Monthly Balance', `$${data.monthlyBalance.toLocaleString()}`],
    ];

    // Add summary table
    pdf.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });

    // Add recent activity
    pdf.text('Recent Activity', 14, pdf.autoTable.previous.finalY + 15);
    
    const activityData = data.recentActivity.map(item => [
      item.name,
      item.category,
      `$${Math.abs(item.amount).toLocaleString()}`
    ]);

    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 20,
      head: [['Transaction', 'Category', 'Amount']],
      body: activityData,
      theme: 'grid',
    });

    // Save the PDF
    pdf.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="flex flex-col gap-6 p-8">
        {/* Header Section with Gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 backdrop-blur-sm border shadow-lg">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome back, demo
                </h1>
                <p className="text-muted-foreground mt-1">Here's your financial insights for today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice Banner */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-500 font-medium">Demo Data Notice</p>
            <p className="text-sm text-yellow-500/80">
              Some data shown in this dashboard are for demonstration purposes only. Proper functionality and real-time data integration will be implemented in future updates.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">${data.totalBalance.toLocaleString()}</h3>
                    <span className="text-xs text-emerald-500 font-medium">+12.5%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Updated just now</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">${data.monthlyBalance.toLocaleString()}</h3>
                    <span className="text-xs text-emerald-500 font-medium">+8.2%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Trending up this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 backdrop-blur-sm bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background to-secondary/20 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", item.bgColor)}>
                        <item.icon className={cn("h-5 w-5", item.color)} />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <p className="font-medium">${Math.abs(item.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Subscription Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.subscriptionAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg transition-all duration-300 hover:shadow-md",
                    `bg-${alert.color}-500/10 hover:bg-${alert.color}-500/20`
                  )}
                >
                  <div className="flex items-center gap-4">
                    <AlertCircle className={`h-5 w-5 text-${alert.color}-500`} />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Add after the Alerts Section */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="backdrop-blur-sm bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Category</p>
                    <p className="font-medium">Shopping</p>
                  </div>
                </div>
                <p className="font-semibold text-emerald-500">$2,450</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payment</p>
                    <p className="font-medium">Rent</p>
                  </div>
                </div>
                <p className="font-semibold text-blue-500">Mar 31</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Goal</p>
                    <p className="font-medium">Vacation Fund</p>
                  </div>
                </div>
                <p className="font-semibold text-purple-500">75%</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Health */}
          <Card className="backdrop-blur-sm bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Savings Rate</p>
                  <p className="text-sm text-emerald-500">Good</p>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-[75%] rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Debt Ratio</p>
                  <p className="text-sm text-yellow-500">Fair</p>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-[45%] rounded-full bg-yellow-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Investment Growth</p>
                  <p className="text-sm text-blue-500">Excellent</p>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-[90%] rounded-full bg-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="backdrop-blur-sm bg-gradient-to-br from-background to-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Credit Card Payment</p>
                    <p className="text-sm text-muted-foreground">Due in 3 days</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">Tax Filing Deadline</p>
                    <p className="text-sm text-muted-foreground">2 weeks remaining</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Repeat className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Insurance Renewal</p>
                    <p className="text-sm text-muted-foreground">Next month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
