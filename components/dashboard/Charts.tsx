'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Monthly spending by category with better data structure
const spendingData = [
  { 
    name: 'Jan',
    Food: 1200,
    Shopping: 800,
    Entertainment: 400,
    Bills: 1600,
    total: 4000,
  },
  {
    name: 'Feb',
    Food: 1100,
    Shopping: 900,
    Entertainment: 500,
    Bills: 1600,
    total: 4100,
  },
  {
    name: 'Mar',
    Food: 1300,
    Shopping: 750,
    Entertainment: 600,
    Bills: 1650,
    total: 4300,
  },
  {
    name: 'Apr',
    Food: 1250,
    Shopping: 850,
    Entertainment: 450,
    Bills: 1600,
    total: 4150,
  },
  {
    name: 'May',
    Food: 1400,
    Shopping: 700,
    Entertainment: 500,
    Bills: 1700,
    total: 4300,
  },
  {
    name: 'Jun',
    Food: 1350,
    Shopping: 800,
    Entertainment: 550,
    Bills: 1650,
    total: 4350,
  },
].map(item => ({
  ...item,
  Food: (item.Food / item.total) * 100,
  Shopping: (item.Shopping / item.total) * 100,
  Entertainment: (item.Entertainment / item.total) * 100,
  Bills: (item.Bills / item.total) * 100,
}));

// Tax deduction opportunities
const taxData = [
  { name: 'Home Office', amount: 2400, fill: '#FF5C5C' },
  { name: 'Healthcare', amount: 1800, fill: '#36B3D1' },
  { name: 'Education', amount: 1200, fill: '#1E293B' },
  { name: 'Charity', amount: 800, fill: '#FFB84D' },
];

// Subscription analysis
const subscriptionData = [
  { name: 'Essential', value: 65, fill: '#FF5C5C' },
  { name: 'Optional', value: 25, fill: '#36B3D1' },
  { name: 'Unused', value: 10, fill: '#1E293B' },
];

// Investment performance
const investmentData = [
  {
    name: 'Stocks',
    performance: 78,
    fill: '#FF5C5C',
  },
  {
    name: 'Real Estate',
    performance: 65,
    fill: '#36B3D1',
  },
  {
    name: 'Bonds',
    performance: 45,
    fill: '#1E293B',
  },
  {
    name: 'Crypto',
    performance: 85,
    fill: '#FFB84D',
  },
];

const COLORS = {
  Food: '#FF5C5C',
  Shopping: '#36B3D1',
  Entertainment: '#1E293B',
  Bills: '#FFB84D'
};

export function DashboardCharts() {
  return (
    <div className="grid gap-6">
      {/* Spending Patterns */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spending Patterns</CardTitle>
              <CardDescription>Monthly expense breakdown by category (%)</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-4">
                {Object.entries(COLORS).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-muted-foreground">{key}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="gap-2">
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={spendingData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="Bills"
                  stackId="1"
                  stroke={COLORS.Bills}
                  fill={COLORS.Bills}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Entertainment"
                  stackId="1"
                  stroke={COLORS.Entertainment}
                  fill={COLORS.Entertainment}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Shopping"
                  stackId="1"
                  stroke={COLORS.Shopping}
                  fill={COLORS.Shopping}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Food"
                  stackId="1"
                  stroke={COLORS.Food}
                  fill={COLORS.Food}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tax Deductions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Deduction Opportunities</CardTitle>
                <CardDescription>Potential savings identified</CardDescription>
              </div>
              <Button variant="ghost" className="gap-2">
                Optimize <ArrowRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                    formatter={(value: any) => [`$${value}`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {taxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Investment Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Investment Performance</CardTitle>
                <CardDescription>Portfolio growth analysis</CardDescription>
              </div>
              <Button variant="ghost" className="gap-2">
                Details <ArrowRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="30%"
                  outerRadius="100%"
                  data={investmentData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise={true}
                    dataKey="performance"
                    cornerRadius={15}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Performance']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 