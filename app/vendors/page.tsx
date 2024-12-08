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
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import { 
  Building2,
  DollarSign,
  FileText,
  Calendar,
  Download,
  Plus,
  Star,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileWarning,
  HelpCircle,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  VendorList, 
  AddVendorDialog,
  ContractManager,
  PaymentTracker,
  VendorComparison 
} from "@/components/vendors/VendorComponents"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Add these test data constants
const TEST_VENDORS = [
  {
    id: crypto.randomUUID(),
    name: "Tech Solutions Inc",
    category: "Software",
    email: "contact@techsolutions.com",
    phone: "555-0123",
    website: "www.techsolutions.com",
    rating: 4,
    status: 'Active' as const,
    totalSpend: 75000,
    paymentTerms: "Net 30"
  },
  {
    id: crypto.randomUUID(),
    name: "Office Supplies Co",
    category: "Supplies",
    email: "orders@officesupplies.com",
    phone: "555-0124",
    website: "www.officesupplies.com",
    rating: 3,
    status: 'Active' as const,
    totalSpend: 25000,
    paymentTerms: "Net 15"
  },
  {
    id: crypto.randomUUID(),
    name: "Marketing Experts",
    category: "Marketing",
    email: "hello@marketingexperts.com",
    phone: "555-0125",
    rating: 5,
    status: 'Active' as const,
    totalSpend: 120000,
    paymentTerms: "Net 45"
  }
];

const TEST_PAYMENTS = [
  {
    id: crypto.randomUUID(),
    vendorId: TEST_VENDORS[0].id,
    vendorName: TEST_VENDORS[0].name,
    amount: 15000,
    dueDate: '2024-03-30',
    status: 'Pending' as const,
    invoiceNumber: 'INV-001',
    description: 'Software License Renewal'
  },
  {
    id: crypto.randomUUID(),
    vendorId: TEST_VENDORS[1].id,
    vendorName: TEST_VENDORS[1].name,
    amount: 5000,
    dueDate: '2024-03-15',
    status: 'Paid' as const,
    invoiceNumber: 'INV-002',
    description: 'Office Supplies Q1'
  }
];

const TEST_CONTRACTS = [
  {
    id: crypto.randomUUID(),
    vendorId: TEST_VENDORS[0].id,
    vendorName: TEST_VENDORS[0].name,
    type: 'Software License',
    startDate: '2024-01-01',
    expiryDate: '2024-12-31',
    value: 60000,
    status: 'Active' as const,
    description: 'Annual Software License Agreement'
  },
  {
    id: crypto.randomUUID(),
    vendorId: TEST_VENDORS[2].id,
    vendorName: TEST_VENDORS[2].name,
    type: 'Service Agreement',
    startDate: '2024-02-01',
    expiryDate: '2025-01-31',
    value: 120000,
    status: 'Active' as const,
    description: 'Marketing Services Contract'
  }
];

const GUIDE_STEPS = [
  {
    title: "Managing Vendors",
    description: "Add and manage vendor information, including contact details, payment terms, and performance ratings.",
    icon: Building2
  },
  {
    title: "Payment Tracking",
    description: "Monitor vendor payments, track due dates, and manage payment statuses to avoid late payments.",
    icon: DollarSign
  },
  {
    title: "Contract Management",
    description: "Keep track of vendor contracts, renewal dates, and contract values. Get alerts for expiring contracts.",
    icon: FileText
  },
  {
    title: "Vendor Comparison",
    description: "Compare vendors by category, analyze spending patterns, and identify cost-saving opportunities.",
    icon: TrendingUp
  },
  {
    title: "Performance Metrics",
    description: "Rate vendor performance, track spending history, and monitor key metrics for better decision-making.",
    icon: Star
  }
];

// Add interfaces
interface PaymentStatus {
  name: string;
  value: number;
}

interface VendorRating {
  name: string;
  rating: number;
}

interface VendorStats {
  totalVendors: number;
  totalSpend: number;
  pendingPayments: number;
  expiringContracts: number;
  paymentStatus: PaymentStatus[];
  vendorRatings: VendorRating[];
}

// Add this constant for guide content
const VENDOR_GUIDE = {
  overview: {
    title: "Vendor Management Overview",
    description: "Learn how to effectively manage your vendor relationships and track expenses.",
    sections: [
      {
        title: "Getting Started",
        items: [
          "Add vendors with their contact details and payment terms",
          "Track payments and manage invoices",
          "Monitor vendor performance through ratings",
          "Manage contracts and renewals"
        ]
      },
      {
        title: "Key Features",
        items: [
          "Vendor Directory: Centralized database of all suppliers",
          "Payment Tracking: Monitor and manage vendor payments",
          "Contract Management: Track agreements and renewals",
          "Performance Ratings: Evaluate vendor reliability"
        ]
      },
      {
        title: "Best Practices",
        items: [
          "Regularly update vendor information",
          "Monitor payment statuses to avoid late fees",
          "Review vendor ratings periodically",
          "Keep contract documentation up to date",
          "Track spending patterns by vendor"
        ]
      }
    ]
  },
  features: [
    {
      title: "Vendor Directory",
      description: "Maintain a comprehensive list of all vendors with contact details, payment terms, and performance history.",
      icon: Building2
    },
    {
      title: "Payment Management",
      description: "Track payments, monitor due dates, and manage payment statuses to ensure timely vendor payments.",
      icon: DollarSign
    },
    {
      title: "Contract Tracking",
      description: "Store and manage vendor contracts, track renewal dates, and receive expiry notifications.",
      icon: FileText
    },
    {
      title: "Performance Monitoring",
      description: "Rate vendor performance, track spending history, and identify top-performing suppliers.",
      icon: Star
    }
  ]
};

export default function VendorsPage() {
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<VendorStats>({
    totalVendors: 0,
    totalSpend: 0,
    pendingPayments: 0,
    expiringContracts: 0,
    paymentStatus: [],
    vendorRatings: []
  });

  // Calculate stats from vendor data
  const calculateStats = () => {
    const vendors: Vendor[] = JSON.parse(localStorage.getItem('finwise_vendors') || '[]');
    const payments: Payment[] = JSON.parse(localStorage.getItem('finwise_vendor_payments') || '[]');
    const contracts: Contract[] = JSON.parse(localStorage.getItem('finwise_vendor_contracts') || '[]');

    setData({
      totalVendors: vendors.length,
      totalSpend: payments.reduce((sum: number, p: Payment) => 
        sum + (p.status === 'Paid' ? p.amount : 0), 0),
      pendingPayments: payments.filter(p => p.status === 'Pending').length,
      expiringContracts: contracts.filter(c => {
        const daysUntilExpiry = Math.ceil(
          (new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length,
      paymentStatus: [
        { name: 'Paid', value: payments.filter(p => p.status === 'Paid').length },
        { name: 'Pending', value: payments.filter(p => p.status === 'Pending').length },
        { name: 'Overdue', value: payments.filter(p => p.status === 'Overdue').length }
      ],
      vendorRatings: vendors.map(v => ({
        name: v.name,
        rating: v.rating || 0
      }))
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

  const loadTestData = () => {
    localStorage.setItem('finwise_vendors', JSON.stringify(TEST_VENDORS));
    localStorage.setItem('finwise_vendor_payments', JSON.stringify(TEST_PAYMENTS));
    localStorage.setItem('finwise_vendor_contracts', JSON.stringify(TEST_CONTRACTS));
    calculateStats();
  };

  const handleResetData = () => {
    localStorage.removeItem('finwise_vendors');
    localStorage.removeItem('finwise_vendor_payments');
    localStorage.removeItem('finwise_vendor_contracts');
    calculateStats();
  };

  const generateVendorReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Vendor Management Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 22, { align: 'center' });

    // Add summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 14, 35);
    
    const summaryData = [
      ['Total Vendors', data.totalVendors],
      ['Total Spend', `$${data.totalSpend.toLocaleString()}`],
      ['Active Contracts', data.activeContracts],
      ['Pending Payments', data.pendingPayments]
    ];

    // Add summary table
    let yPos = 40;
    pdf.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });

    // Add vendor list
    yPos = pdf.lastAutoTable.finalY + 15;
    pdf.text('Vendor Directory', 14, yPos);
    
    // Get vendors from localStorage
    const vendors = JSON.parse(localStorage.getItem('finwise_vendors') || '[]');
    const vendorData = vendors.map(vendor => [
      vendor.name,
      vendor.category,
      vendor.status,
      `$${vendor.totalSpend.toLocaleString()}`,
      vendor.paymentTerms,
      vendor.rating ? '⭐'.repeat(vendor.rating) : 'N/A'
    ]);

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Name', 'Category', 'Status', 'Total Spend', 'Payment Terms', 'Rating']],
      body: vendorData,
      theme: 'grid',
    });

    // Add active contracts
    yPos = pdf.lastAutoTable.finalY + 15;
    pdf.text('Active Contracts', 14, yPos);
    
    const contracts = JSON.parse(localStorage.getItem('finwise_vendor_contracts') || '[]');
    const activeContracts = contracts.filter(c => c.status === 'Active');
    const contractData = activeContracts.map(contract => [
      contract.vendorName,
      contract.type,
      new Date(contract.startDate).toLocaleDateString(),
      new Date(contract.expiryDate).toLocaleDateString(),
      `$${contract.value.toLocaleString()}`,
      contract.status
    ]);

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Vendor', 'Type', 'Start Date', 'End Date', 'Value', 'Status']],
      body: contractData,
      theme: 'grid',
    });

    // Add pending payments
    yPos = pdf.lastAutoTable.finalY + 15;
    pdf.text('Pending Payments', 14, yPos);
    
    const payments = JSON.parse(localStorage.getItem('finwise_vendor_payments') || '[]');
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const paymentData = pendingPayments.map(payment => [
      payment.vendorName,
      payment.invoiceNumber,
      new Date(payment.dueDate).toLocaleDateString(),
      `$${payment.amount.toLocaleString()}`,
      payment.status
    ]);

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Vendor', 'Invoice', 'Due Date', 'Amount', 'Status']],
      body: paymentData,
      theme: 'grid',
    });

    // Save the PDF
    pdf.save(`vendor-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage supplier relationships
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
          <Button variant="outline" onClick={() => setShowGuide(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Guide
          </Button>
          <Button onClick={() => setShowAddVendor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
          <Button onClick={generateVendorReport}>
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
                <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(data.totalSpend)}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <h3 className="text-2xl font-bold mt-1">{data.totalVendors}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <h3 className="text-2xl font-bold mt-1">{data.pendingPayments}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Expiring Contracts</p>
                <h3 className="text-2xl font-bold mt-1">{data.expiringContracts}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <FileWarning className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Payment Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Overview of vendor payment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.paymentStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {data.paymentStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Ratings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Ratings</CardTitle>
                <CardDescription>Performance ratings of top vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data.vendorRatings}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar
                        name="Rating"
                        dataKey="rating"
                        stroke="#4ade80"
                        fill="#4ade80"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <VendorList />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentTracker />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractManager />
        </TabsContent>
      </Tabs>

      <AddVendorDialog 
        open={showAddVendor} 
        onOpenChange={setShowAddVendor} 
      />

      {/* Add Guide Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle>{VENDOR_GUIDE.overview.title}</DialogTitle>
            <DialogDescription>
              {VENDOR_GUIDE.overview.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Getting Started Section */}
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">{VENDOR_GUIDE.overview.sections[0].title}</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {VENDOR_GUIDE.overview.sections[0].items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              {VENDOR_GUIDE.features.map((feature, index) => (
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
              <h3 className="font-semibold mb-2">{VENDOR_GUIDE.overview.sections[2].title}</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {VENDOR_GUIDE.overview.sections[2].items.map((item, index) => (
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
    </div>
  )
} 