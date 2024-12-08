'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Book,
  FileText,
  CreditCard,
  Repeat,
  TrendingUp,
  Calculator,
  LineChart,
  BarChart,
  Users,
  Building2,
  Wallet,
  Search,
  ChevronRight,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
  HelpCircle
} from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Budget Planning",
    description: "Create and manage your budgets effectively",
    items: [
      "Create custom budgets",
      "Category-wise budget allocation",
      "Budget vs actual tracking",
      "Visual budget analytics",
      "Spending alerts",
      "Budget recommendations"
    ]
  },
  {
    icon: LineChart,
    title: "Cash Flow Forecasting",
    description: "Predict and analyze your future cash flows",
    items: [
      "Future cash flow predictions",
      "Scenario analysis",
      "Revenue forecasting",
      "Expense projections",
      "Interactive visualizations",
      "Trend analysis"
    ]
  },
  {
    icon: BarChart,
    title: "Profit & Loss Statements",
    description: "Track your business performance",
    items: [
      "Automated P&L generation",
      "Revenue tracking",
      "Expense categorization",
      "Margin analysis",
      "Period comparisons",
      "Export capabilities"
    ]
  },
  {
    icon: Users,
    title: "Payroll Management",
    description: "Manage employee compensation and expenses",
    items: [
      "Employee database",
      "Salary processing",
      "Tax calculations",
      "Reimbursement tracking",
      "Department budgets",
      "Payroll reports"
    ]
  },
  {
    icon: Building2,
    title: "Vendor Management",
    description: "Track and manage supplier relationships",
    items: [
      "Vendor database",
      "Payment tracking",
      "Contract management",
      "Vendor performance",
      "Spending analytics",
      "Payment scheduling"
    ]
  },
  {
    icon: Wallet,
    title: "Loan Management",
    description: "Track and manage your loans and debts",
    items: [
      "Loan portfolio tracking",
      "Payment scheduling",
      "Interest calculations",
      "Loan comparison",
      "Amortization schedules",
      "Payment reminders"
    ]
  }
];

const aiFeatures = [
  {
    title: "Bank Statement Analysis",
    description: "Intelligent processing of bank statements",
    implementation: "Uses GPT-4 for accurate data extraction",
    features: [
      "Extracts transaction data",
      "Identifies bank details",
      "Detects statement period",
      "Validates account information",
      "Standardizes data format"
    ]
  },
  // Add other AI features
];

const faq = [
  {
    question: "How do I get started with FinWise?",
    answer: "Start by uploading your bank statements in the Upload Files section. Our AI will automatically process and categorize your transactions, giving you immediate insights into your financial health."
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, we use industry-standard encryption and security measures. Your data is encrypted both in transit and at rest. We never store your bank credentials, and all processing is done securely."
  },
  {
    question: "How does the AI categorization work?",
    answer: "Our AI uses OpenAI's GPT-4 model to analyze transaction descriptions and automatically categorize them. It learns from patterns in your spending and becomes more accurate over time."
  },
  {
    question: "Can I export my financial reports?",
    answer: "Yes, you can export reports in PDF format from any section. The reports include detailed analytics, charts, and summaries of your financial data."
  },
  {
    question: "How often should I upload my statements?",
    answer: "We recommend uploading statements monthly to keep your financial insights current. You can upload multiple statements at once, and our system will handle duplicates automatically."
  },
  {
    question: "What file formats are supported?",
    answer: "We support Excel (.xlsx, .xls), CSV, and text (.txt) files. The system can automatically detect and process most bank statement formats."
  },
  {
    question: "Can I customize expense categories?",
    answer: "Yes, you can create custom categories and subcategories. The AI will learn from your categorization preferences and apply them to future transactions."
  },
  {
    question: "How do I track business expenses separately?",
    answer: "You can tag transactions as personal or business. The system will maintain separate analytics and reports for each type of expense."
  },
  {
    question: "Is there a mobile app available?",
    answer: "Currently, FinWise is a web application optimized for both desktop and mobile browsers. A native mobile app is planned for future release."
  },
  {
    question: "How can I get support?",
    answer: "You can reach our support team through the Help Center or by emailing support@finwise.com. We typically respond within 24 hours."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">Learn how to use FinWise features</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick links to help you get started with FinWise</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 justify-start">
            <Book className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">User Guide</p>
              <p className="text-sm text-muted-foreground">Complete documentation</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">Video Tutorials</p>
              <p className="text-sm text-muted-foreground">Step-by-step guides</p>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">Best Practices</p>
              <p className="text-sm text-muted-foreground">Tips and tricks</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-5 w-5" />
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-sm">
                {feature.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Features</CardTitle>
          <CardDescription>Learn about our OpenAI integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <p className="text-sm text-primary mt-1">{feature.implementation}</p>
                </div>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  {feature.features.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about FinWise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {faq.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <span className="text-primary">Q:</span>
                  {item.question}
                </h3>
                <p className="text-sm text-muted-foreground pl-6">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          asChild
          className="hover:text-blue-500"
        >
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Visit LinkedIn Profile"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          asChild
          className="hover:text-sky-500"
        >
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Visit Twitter Profile"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          asChild
          className="hover:text-gray-900 dark:hover:text-white"
        >
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Visit GitHub Profile"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  )
} 