'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { cn } from "@/lib/utils"

interface PerformanceChartProps {
  data: any[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Calculate performance data points
  const performanceData = data.reduce((acc: any[], inv) => {
    const existingDate = acc.find(item => item.date === inv.lastUpdated);
    if (existingDate) {
      existingDate.value += inv.value;
      existingDate.return = ((existingDate.value - existingDate.initialValue) / existingDate.initialValue * 100).toFixed(2);
    } else {
      acc.push({
        date: inv.lastUpdated,
        value: inv.value,
        initialValue: inv.initialValue,
        return: ((inv.value - inv.initialValue) / inv.initialValue * 100).toFixed(2)
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate overall return
  const totalReturn = performanceData.length > 0 ? 
    parseFloat(performanceData[performanceData.length - 1].return) : 0;

  return (
    <div className="space-y-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={performanceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={totalReturn >= 0 ? "#10B981" : "#EF4444"}
                  stopOpacity={0.8}
                />
                <stop 
                  offset="95%" 
                  stopColor={totalReturn >= 0 ? "#10B981" : "#EF4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              opacity={0.1}
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={totalReturn >= 0 ? "#10B981" : "#EF4444"}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-lg p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Return</p>
          <p className={cn(
            "text-2xl font-bold",
            totalReturn >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {totalReturn >= 0 ? "+" : ""}{totalReturn}%
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Peak Value</p>
          <p className="text-2xl font-bold">
            ${Math.max(...performanceData.map(d => d.value)).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Current Value</p>
          <p className="text-2xl font-bold">
            ${performanceData[performanceData.length - 1]?.value.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  )
} 