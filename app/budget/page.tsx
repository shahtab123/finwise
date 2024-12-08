'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  DollarSign,
  PiggyBank,
  AlertCircle,
  TrendingUp,
  Edit2,
  Trash2,
  Plus,
  Save,
  ShoppingCart, Coffee, Home, Car, Briefcase, 
  Smartphone, Zap, Gift, Plane, Book, 
  DollarSign as DollarIcon, CreditCard, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import {
  MonthlyBudget,
  BudgetCategory,
  calculatePercentage,
  generateMockData,
  saveBudget,
  loadBudget,
  addCategory,
  updateCategory,
  deleteCategory,
  generateTrendData,
  getMonthName
} from '@/lib/services/budget-manager'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const CATEGORY_ICONS = [
  { icon: ShoppingCart, label: 'Shopping' },
  { icon: Coffee, label: 'Food & Drinks' },
  { icon: Home, label: 'Housing' },
  { icon: Car, label: 'Transportation' },
  { icon: Briefcase, label: 'Business' },
  { icon: Smartphone, label: 'Technology' },
  { icon: Zap, label: 'Utilities' },
  { icon: Gift, label: 'Entertainment' },
  { icon: Plane, label: 'Travel' },
  { icon: Book, label: 'Education' },
  { icon: DollarIcon, label: 'Income' },
  { icon: CreditCard, label: 'Other' }
];

export default function BudgetPage() {
  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate);

  // Initialize with empty state
  const [budgets, setBudgets] = useState<{ [key: string]: MonthlyBudget }>({});
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  
  // Load data on mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('finwise_budgets');
    if (savedBudgets) {
      const parsed = JSON.parse(savedBudgets);
      setBudgets(parsed);
      setBudget(parsed[currentMonth] || generateMockData());
    } else {
      // If no saved data, initialize with mock data for current month
      const initialBudget = generateMockData();
      setBudgets({ [currentMonth]: initialBudget });
      setBudget(initialBudget);
      // Save initial data
      localStorage.setItem('finwise_budgets', JSON.stringify({ [currentMonth]: initialBudget }));
    }
  }, []);

  // Save budgets whenever they change
  useEffect(() => {
    if (Object.keys(budgets).length > 0) {
      localStorage.setItem('finwise_budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');
  const [selectedMonth, setSelectedMonth] = useState(getMonthName(new Date()));
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingMonth, setPendingMonth] = useState<string | null>(null);

  const generateMonthOptions = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      months.push({
        value: getMonthName(date),
        label: getMonthName(date)
      });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();

  const handleSave = () => {
    if (!budget) return;
    
    const updatedBudgets = {
      ...budgets,
      [selectedMonth]: budget
    };
    setBudgets(updatedBudgets);
    localStorage.setItem('finwise_budgets', JSON.stringify(updatedBudgets));
  };

  const handleAddCategory = (newCategory: BudgetCategory) => {
    const categoryWithId = {
      ...newCategory,
      id: crypto.randomUUID(),
      type: viewType
    };
    
    const updatedBudget = {
      ...budget,
      categories: [...budget.categories, categoryWithId],
      totalBudget: budget.totalBudget + categoryWithId.budget,
      totalSpent: budget.totalSpent + categoryWithId.spent
    };
    
    setBudget(updatedBudget);
    setBudgets(prev => ({
      ...prev,
      [selectedMonth]: updatedBudget
    }));
    
    setIsAddingCategory(false);
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<BudgetCategory>) => {
    const updatedBudget = updateCategory(budget, categoryId, updates);
    setBudget(updatedBudget);
    setBudgets(prev => ({
      ...prev,
      [selectedMonth]: updatedBudget
    }));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedBudget = deleteCategory(budget, categoryId);
    setBudget(updatedBudget);
    setBudgets(prev => ({
      ...prev,
      [selectedMonth]: updatedBudget
    }));
  };

  const handleMonthChange = (newMonth: string) => {
    // Get month indices for comparison
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthIndex = months.indexOf(currentMonth);
    const newMonthIndex = months.indexOf(newMonth);
    
    if (!budgets[newMonth]) {
      // Only show import dialog for future months
      if (newMonthIndex > currentMonthIndex) {
        setPendingMonth(newMonth);
        setShowImportDialog(true);
      } else {
        // For past months, just create empty budget
        const newBudget: MonthlyBudget = {
          month: newMonth,
          year: currentDate.getFullYear(),
          totalBudget: 0,
          totalSpent: 0,
          categories: []
        };
        setBudgets(prev => ({
          ...prev,
          [newMonth]: newBudget
        }));
        setBudget(newBudget);
        setSelectedMonth(newMonth);
      }
    } else {
      // If budget exists, just switch to it
      setSelectedMonth(newMonth);
    }
  };

  const handleImportData = (shouldImport: boolean) => {
    if (!pendingMonth) return;

    if (shouldImport && selectedMonth) {
      const newBudget: MonthlyBudget = {
        month: pendingMonth,
        year: currentDate.getFullYear(),
        totalBudget: budget.totalBudget,
        totalSpent: 0,
        categories: budget.categories.map(cat => ({
          ...cat,
          spent: 0,
          id: crypto.randomUUID()
        }))
      };
      setBudgets(prev => ({
        ...prev,
        [pendingMonth]: newBudget
      }));
      setBudget(newBudget);
    } else {
      const newBudget: MonthlyBudget = {
        month: pendingMonth,
        year: currentDate.getFullYear(),
        totalBudget: 0,
        totalSpent: 0,
        categories: []
      };
      setBudgets(prev => ({
        ...prev,
        [pendingMonth]: newBudget
      }));
      setBudget(newBudget);
    }

    setSelectedMonth(pendingMonth);
    setPendingMonth(null);
    setShowImportDialog(false);
  };

  // Add this function to calculate trend data from budgets
  const calculateTrendData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthIndex = months.indexOf(currentMonth);
    
    // Get last 6 months including current month
    const trendMonths = months
      .slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1)
      .reverse();

    return trendMonths.map(month => {
      const monthBudget = budgets[month];
      return {
        month,
        budget: monthBudget ? monthBudget.totalBudget : 0,
        spent: monthBudget ? monthBudget.totalSpent : 0
      };
    });
  };

  // Replace the trendData state with a computed value
  // Remove this line:
  // const [trendData] = useState(generateTrendData());

  // Add this where you need the trend data
  const trendData = calculateTrendData();

  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Budget Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`${selectedMonth} ${currentDate.getFullYear()}`, pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 14, 35);
    
    const summaryData = [
      ['Total Budget', `$${budget.totalBudget.toLocaleString()}`],
      ['Amount Spent', `$${budget.totalSpent.toLocaleString()}`],
      ['Remaining', `$${(budget.totalBudget - budget.totalSpent).toLocaleString()}`],
      ['Budget Usage', `${Math.round((budget.totalSpent / budget.totalBudget) * 100)}%`]
    ];

    autoTable(pdf, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [76, 205, 196] }
    });

    // Add categories section
    pdf.setFontSize(14);
    pdf.text('Budget Categories', 14, pdf.lastAutoTable.finalY + 15);

    const categoriesData = budget.categories.map(cat => [
      cat.name,
      cat.type,
      `$${cat.budget.toLocaleString()}`,
      `$${cat.spent.toLocaleString()}`,
      `${calculatePercentage(cat.spent, cat.budget)}%`
    ]);

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 20,
      head: [['Category', 'Type', 'Budget', 'Spent', 'Usage']],
      body: categoriesData,
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

    // Add insights section
    const overBudgetCategories = budget.categories.filter(
      cat => calculatePercentage(cat.spent, cat.budget) > 90
    );
    const underutilizedCategories = budget.categories.filter(
      cat => calculatePercentage(cat.spent, cat.budget) < 50
    );

    if (overBudgetCategories.length > 0 || underutilizedCategories.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Budget Insights', 14, 15);
      
      let yPos = 25;
      
      overBudgetCategories.forEach(cat => {
        pdf.setFontSize(12);
        pdf.text(`${cat.name} - Over Budget`, 14, yPos);
        pdf.setFontSize(10);
        pdf.text(
          `This category has exceeded ${calculatePercentage(cat.spent, cat.budget)}% of its budget.`,
          14, yPos + 5
        );
        yPos += 15;
      });

      underutilizedCategories.forEach(cat => {
        pdf.setFontSize(12);
        pdf.text(`${cat.name} - Underutilized`, 14, yPos);
        pdf.setFontSize(10);
        pdf.text(
          `Only ${calculatePercentage(cat.spent, cat.budget)}% of budget used.`,
          14, yPos + 5
        );
        yPos += 15;
      });
    }

    // Save the PDF
    pdf.save(`budget-report-${selectedMonth.toLowerCase()}-${currentDate.getFullYear()}.pdf`);
  };

  if (!budget) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Budget Planner</h1>
          <p className="text-muted-foreground mt-1">Track and manage your business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <h3 className="text-2xl font-bold mt-1">${budget.totalBudget.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Spent</p>
                <h3 className="text-2xl font-bold mt-1">${budget.totalSpent.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <h3 className="text-2xl font-bold mt-1">${(budget.totalBudget - budget.totalSpent).toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Usage</p>
                <h3 className="text-2xl font-bold mt-1">
                  {Math.round((budget.totalSpent / budget.totalBudget) * 100)}%
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Budget Categories - Now full height */}
        <Card className="md:col-span-7 min-h-[1400px] flex flex-col">
          <CardHeader className="flex-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Budget Categories</CardTitle>
                <CardDescription>Manage your budget allocations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button onClick={() => setIsAddingCategory(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>
            
            {/* Toggle for Expense/Income */}
            <div className="flex items-center p-1 bg-muted rounded-lg w-fit">
              <button
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewType === 'expense' ? 
                    "bg-background text-foreground shadow-sm" : 
                    "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewType('expense')}
              >
                Expenses
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewType === 'income' ? 
                    "bg-background text-foreground shadow-sm" : 
                    "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewType('income')}
              >
                Income
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-grow overflow-auto">
            <div className="space-y-6">
              {budget.categories
                .filter(cat => viewType === 'expense' ? cat.type === 'expense' : cat.type === 'income')
                .map((category) => (
                  <div
                    key={category.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div 
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              calculatePercentage(category.spent, category.budget) > 90 ? 'destructive' :
                              calculatePercentage(category.spent, category.budget) > 75 ? 'warning' :
                              'default'
                            }>
                              {calculatePercentage(category.spent, category.budget)}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory(category.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                          <span>Spent: ${category.spent.toLocaleString()}</span>
                          <span>Budget: ${category.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={calculatePercentage(category.spent, category.budget)}
                      className="h-2"
                      indicatorColor={cn(
                        calculatePercentage(category.spent, category.budget) > 90 && "bg-red-500",
                        calculatePercentage(category.spent, category.budget) > 75 && "bg-yellow-500",
                        "bg-primary"
                      )}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts and Insights - Now with explicit height */}
        <div className="md:col-span-5 space-y-6" id="charts-container">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Budget vs actual spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
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
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#4ECDC4" 
                      name="Budget"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spent" 
                      stroke="#FF6B6B" 
                      name="Spent"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Category Comparison</CardTitle>
              <CardDescription>Budget vs actual by category ({selectedMonth})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budget.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
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
                    <Bar dataKey="budget" name="Budget" fill="#4ECDC4" />
                    <Bar dataKey="spent" name="Spent" fill="#FF6B6B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Insights</CardTitle>
              <CardDescription>Tips to optimize your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budget.categories
                  .filter(cat => calculatePercentage(cat.spent, cat.budget) > 90)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-lg bg-red-500/10"
                    >
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{cat.name} Over Budget</p>
                          <p className="text-sm text-muted-foreground">
                            This category has exceeded {calculatePercentage(cat.spent, cat.budget)}% of its budget.
                            Consider reallocating funds or reviewing expenses.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {budget.categories
                  .filter(cat => calculatePercentage(cat.spent, cat.budget) < 50)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-lg bg-emerald-500/10"
                    >
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">{cat.name} Underutilized</p>
                          <p className="text-sm text-muted-foreground">
                            Only {calculatePercentage(cat.spent, cat.budget)}% of budget used.
                            Consider reducing this category's budget next month.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Category Dialog */}
      <DialogPrimitive.Root 
        open={isAddingCategory || editingCategory !== null} 
        onOpenChange={() => {
          setIsAddingCategory(false);
          setEditingCategory(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {isAddingCategory ? 'Add Category' : 'Edit Category'}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {isAddingCategory ? 'Create a new budget category' : 'Update budget category'}
              </DialogPrimitive.Description>
            </div>
            
            <CategoryForm
              onSubmit={(data) => {
                if (isAddingCategory) {
                  handleAddCategory({
                    id: Math.random().toString(),
                    ...data
                  });
                } else if (editingCategory) {
                  handleUpdateCategory(editingCategory, data);
                }
              }}
              initialData={editingCategory ? 
                budget.categories.find(cat => cat.id === editingCategory) 
                : undefined
              }
            />

            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowImportDialog(false);
                setPendingMonth(null);
                setSelectedMonth(currentMonth); // Reset to current month
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Previous Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to import budget categories from {selectedMonth}? 
              This will copy all categories and their budgeted amounts, but start with zero spending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleImportData(false)}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleImportData(true)}>
              Import Categories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryForm({ onSubmit, initialData }: {
  onSubmit: (data: Omit<BudgetCategory, 'id'>) => void
  initialData?: BudgetCategory
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    budget: initialData?.budget || 0,
    spent: initialData?.spent || 0,
    color: initialData?.color || '#FF6B6B',
    type: initialData?.type || 'expense',
    icon: initialData?.icon || 'ShoppingCart'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
          <label className="text-right text-sm">Budget</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm">Spent</label>
          <input
            type="number"
            value={formData.spent}
            onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) })}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm">Color</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="col-span-3 flex h-9 w-full"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm">Icon</label>
          <div className="col-span-3 grid grid-cols-6 gap-2">
            {CATEGORY_ICONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setFormData({ ...formData, icon: label })}
                className={cn(
                  "p-2 rounded-md hover:bg-muted flex items-center justify-center",
                  formData.icon === label && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit">
          {initialData ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
} 