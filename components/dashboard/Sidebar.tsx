'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Upload,
  CreditCard,
  Repeat,
  PiggyBank,
  TrendingUp,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  Menu,
  LogOut,
  Calculator,
  LineChart,
  BarChart,
  Users,
  Building2,
  Wallet
} from "lucide-react"
import { useState, useEffect } from "react"

const sidebarItems = [
  { 
    icon: Home, 
    label: "Overview", 
    href: "/"
  },
  { 
    icon: Upload, 
    label: "Upload Files", 
    href: "/upload"
  },
  {
    icon: CreditCard,
    label: "Expenses",
    href: "/expenses"
  },
  {
    icon: Repeat,
    label: "Subscriptions",
    href: "/subscriptions"
  },
  {
    icon: TrendingUp,
    label: "Investments",
    href: "/investments"
  },
  {
    icon: Calculator,
    label: "Budget Planner",
    href: "/budget"
  },
  {
    icon: LineChart,
    label: "Cash Flow Forecast",
    href: "/cashflow"
  },
  {
    icon: BarChart,
    label: "P&L Statements",
    href: "/profit-loss"
  },
  {
    icon: Users,
    label: "Payroll & Expenses",
    href: "/payroll"
  },
  {
    icon: Building2,
    label: "Vendor Management",
    href: "/vendors"
  },
  {
    icon: Wallet,
    label: "Loan Manager",
    href: "/loans"
  },
  {
    icon: PiggyBank,
    label: "Tax Deductions",
    href: "/tax",
    badge: "Upcoming Feature",
    badgeVariant: "destructive"
  }
]

const bottomItems = [
  { 
    icon: Settings, 
    label: "Settings", 
    href: "/settings",
    onClick: () => {
      window.location.href = "/settings";
    }
  },
  { 
    icon: HelpCircle, 
    label: "Help Center", 
    href: "/help",
    onClick: () => {
      window.location.href = "/help";
    }
  }
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background px-4 flex items-center md:hidden z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            FinWise
          </h1>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex flex-col bg-card border-r shadow-lg transition-transform duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72",
        // Mobile: slide in/out from left
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always show
        "md:translate-x-0",
        // Add top padding on mobile for header
        "pt-16 md:pt-0"
      )}>
        {/* Logo Section - Hide on mobile since it's in the header */}
        <div className="hidden md:flex h-16 items-center justify-between px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">F</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                FinWise
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex hover:bg-secondary"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn(
              "h-6 w-6 transition-transform duration-300",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="px-4 py-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
                    alt="avatar"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">demo</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start relative group hover:bg-secondary/80",
                collapsed ? "px-3" : "px-4",
                pathname === item.href && "bg-secondary/50 hover:bg-secondary"
              )}
              onClick={() => setMobileOpen(false)} // Close mobile menu on click
            >
              <Link href={item.href}>
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-lg bg-primary opacity-0 transition-opacity",
                  pathname === item.href && "opacity-100"
                )} />
                <item.icon className={cn(
                  "h-5 w-5",
                  pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
                {!collapsed && (
                  <span className={cn(
                    "flex-1 text-left",
                    pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    item.badgeVariant === "destructive" ? "bg-red-500/10 text-red-500" :
                    pathname === item.href ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t px-3 py-4">
          {bottomItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start mb-1 hover:bg-secondary/80",
                collapsed ? "px-3" : "px-4"
              )}
              onClick={item.onClick}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 text-muted-foreground" />
                {!collapsed && <span className="flex-1 text-left text-muted-foreground">{item.label}</span>}
              </Link>
            </Button>
          ))}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500",
              collapsed ? "px-3" : "px-4"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="flex-1 text-left">Log Out</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
} 