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
  Cell
} from 'recharts'
import { 
  Users,
  DollarSign,
  Receipt,
  Calendar,
  Download,
  Plus,
  FileText,
  Building2,
  Wallet,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  EmployeeList, 
  PayrollCalendar, 
  ReimbursementTracker, 
  AddEmployeeDialog, 
  PayrollRulesDialog 
} from "@/components/payroll/PayrollComponents"
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Add type declaration to extend jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const MOCK_DATA = {
  totalEmployees: 45,
  totalPayroll: 225000,
  pendingReimbursements: 12,
  nextPayrollDate: '2024-03-25',
  departments: [
    { name: 'Engineering', employees: 15, totalSalary: 95000 },
    { name: 'Sales', employees: 10, totalSalary: 55000 },
    { name: 'Marketing', employees: 8, totalSalary: 35000 },
    { name: 'Operations', employees: 7, totalSalary: 25000 },
    { name: 'HR', employees: 5, totalSalary: 15000 }
  ],
  payrollTrend: [
    { month: 'Jan', amount: 220000 },
    { month: 'Feb', amount: 223000 },
    { month: 'Mar', amount: 225000 }
  ]
};

const TEST_EMPLOYEES = [
  {
    id: 1,
    name: "John Doe",
    position: "Software Engineer",
    department: "Engineering",
    salary: 85000,
    status: "Active",
    joinDate: "2023-01-15",
    lastPayroll: "2024-02-28"
  },
  {
    id: 2,
    name: "Jane Smith",
    position: "Marketing Manager",
    department: "Marketing",
    salary: 75000,
    status: "Active",
    joinDate: "2023-03-01",
    lastPayroll: "2024-02-28"
  },
  {
    id: 3,
    name: "Mike Johnson",
    position: "Sales Director",
    department: "Sales",
    salary: 95000,
    status: "Active",
    joinDate: "2023-02-15",
    lastPayroll: "2024-02-28"
  }
];

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export default function PayrollPage() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayrollRules, setShowPayrollRules] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    pendingReimbursements: 0,
    nextPayrollDate: new Date().toISOString().split('T')[0],
    departments: [],
    payrollTrend: []
  });

  const calculateStats = () => {
    const employees = JSON.parse(localStorage.getItem('finwise_employees') || '[]');
    
    const departmentStats = employees.reduce((acc: any[], emp: any) => {
      const dept = acc.find(d => d.name === emp.department);
      if (dept) {
        dept.employees++;
        dept.totalSalary += parseFloat(emp.salary);
      } else {
        acc.push({
          name: emp.department,
          employees: 1,
          totalSalary: parseFloat(emp.salary)
        });
      }
      return acc;
    }, []);

    const totalPayroll = employees.reduce((sum: number, emp: any) => 
      sum + parseFloat(emp.salary), 0);

    setData({
      totalEmployees: employees.length,
      totalPayroll,
      pendingReimbursements: 0,
      nextPayrollDate: new Date().toISOString().split('T')[0],
      departments: departmentStats,
      payrollTrend: [
        { month: 'Jan', amount: totalPayroll * 0.95 },
        { month: 'Feb', amount: totalPayroll * 0.98 },
        { month: 'Mar', amount: totalPayroll }
      ]
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

  const loadTestData = () => {
    const testEmployees = TEST_EMPLOYEES.map(emp => ({
      ...emp,
      id: crypto.randomUUID()
    }));
    
    localStorage.setItem('finwise_employees', JSON.stringify(testEmployees));
    calculateStats();
  };

  const handleResetData = () => {
    localStorage.removeItem('finwise_employees');
    localStorage.removeItem('finwise_payroll_rules');
    localStorage.removeItem('finwise_reimbursements');
    
    setData({
      totalEmployees: 0,
      totalPayroll: 0,
      pendingReimbursements: 0,
      nextPayrollDate: new Date().toISOString().split('T')[0],
      departments: [],
      payrollTrend: []
    });

    calculateStats();
  };

  const generatePDF = async () => {
    // Implement PDF generation logic
  };

  const generatePayrollReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Payroll & Expenses Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 14, 35);
    
    const summaryData = [
      ['Total Employees', data.totalEmployees],
      ['Total Payroll', `$${data.totalPayroll.toLocaleString()}`],
      ['Pending Reimbursements', data.pendingReimbursements],
      ['Next Payroll Date', new Date(data.nextPayrollDate).toLocaleDateString()]
    ];

    // Add summary table
    pdf.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });

    // Add department breakdown
    pdf.text('Department Breakdown', 14, pdf.autoTable.previous.finalY + 15);
    
    const departmentData = data.departments.map(dept => [
      dept.name,
      dept.employees,
      `$${dept.totalSalary.toLocaleString()}`
    ]);

    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 20,
      head: [['Department', 'Employees', 'Total Salary']],
      body: departmentData,
      theme: 'grid',
    });

    // Add employee directory
    pdf.text('Employee Directory', 14, pdf.autoTable.previous.finalY + 15);
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('finwise_employees') || '[]');
    const employeeData = employees.map(emp => [
      emp.name,
      emp.position,
      emp.department,
      `$${emp.salary.toLocaleString()}/yr`,
      emp.status,
      new Date(emp.joinDate).toLocaleDateString()
    ]);

    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 20,
      head: [['Name', 'Position', 'Department', 'Salary', 'Status', 'Join Date']],
      body: employeeData,
      theme: 'grid',
      styles: { fontSize: 8 }, // Smaller font for employee table
      columnStyles: {
        0: { cellWidth: 30 }, // Name
        1: { cellWidth: 35 }, // Position
        2: { cellWidth: 30 }, // Department
        3: { cellWidth: 25 }, // Salary
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 25 }  // Join Date
      }
    });

    // Save the PDF
    pdf.save(`payroll-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Payroll & Employee Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage employee compensation and reimbursements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPayrollRules(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Payroll Rules
          </Button>
          <Button onClick={() => setShowAddEmployee(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button onClick={generatePayrollReport}>
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
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(data.totalPayroll)}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <h3 className="text-2xl font-bold mt-1">{data.totalEmployees}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reimbursements</p>
                <h3 className="text-2xl font-bold mt-1">{data.pendingReimbursements}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Payroll</p>
                <h3 className="text-2xl font-bold mt-1">
                  {new Date(data.nextPayrollDate).toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
          <TabsTrigger value="calendar">Payroll Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Department Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution by Department</CardTitle>
                <CardDescription>Breakdown of payroll costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.departments}
                        dataKey="totalSalary"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {data.departments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Payroll Trend</CardTitle>
                <CardDescription>Total payroll over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.payrollTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#4ade80" name="Total Payroll" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Details */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Employee count and payroll by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.departments.map((dept, index) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                      >
                        <Building2 className="h-5 w-5" style={{ color: COLORS[index % COLORS.length] }} />
                      </div>
                      <div>
                        <h4 className="font-medium">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(dept.totalSalary)}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((dept.totalSalary / data.totalPayroll) * 100)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="reimbursements">
          <ReimbursementTracker />
        </TabsContent>

        <TabsContent value="calendar">
          <PayrollCalendar />
        </TabsContent>
      </Tabs>

      <AddEmployeeDialog 
        open={showAddEmployee} 
        onOpenChange={setShowAddEmployee} 
      />

      <PayrollRulesDialog 
        open={showPayrollRules} 
        onOpenChange={setShowPayrollRules} 
      />
    </div>
  )
} 