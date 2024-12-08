'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import { Badge } from "@/components/ui/badge"

interface PortfolioDistributionProps {
  investments: any[]
}

export function PortfolioDistribution({ investments }: PortfolioDistributionProps) {
  // Calculate total portfolio value
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);

  // Group investments by type and calculate percentages
  const distribution = investments.reduce((acc: any[], inv) => {
    const existing = acc.find(item => item.type === inv.type);
    if (existing) {
      existing.value += inv.value;
    } else {
      acc.push({
        type: inv.type,
        value: inv.value,
        percentage: 0
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    percentage: (item.value / totalValue * 100).toFixed(1)
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

  return (
    <div className="space-y-6">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {distribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
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

      <div className="space-y-2">
        {distribution.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium capitalize">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>${item.value.toLocaleString()}</span>
              <Badge variant="secondary">{item.percentage}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 