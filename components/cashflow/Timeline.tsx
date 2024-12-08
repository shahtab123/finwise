'use client'

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { cn } from "@/lib/utils"

interface TimelineEvent {
  date: string
  amount: number
  type: 'inflow' | 'outflow'
  description: string
  category: string
}

interface TimelineProps {
  data: {
    date: string
    inflows: number
    outflows: number
    balance: number
    events: TimelineEvent[]
  }[]
}

export function CashFlowTimeline({ data }: TimelineProps) {
  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
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
            <Bar 
              yAxisId="left"
              dataKey="inflows" 
              name="Inflows" 
              fill="#4ade80" 
              opacity={0.8}
            />
            <Bar 
              yAxisId="left"
              dataKey="outflows" 
              name="Outflows" 
              fill="#f87171" 
              opacity={0.8}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="balance" 
              name="Balance" 
              stroke="#60a5fa"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {data.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{day.date}</h4>
              <span className={cn(
                "text-sm font-medium",
                day.balance >= 0 ? "text-emerald-500" : "text-red-500"
              )}>
                Balance: ${day.balance.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1">
              {day.events.map((event, eventIndex) => (
                <div 
                  key={eventIndex}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    event.type === 'inflow' ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}
                >
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                  <span className={cn(
                    "font-medium",
                    event.type === 'inflow' ? "text-emerald-500" : "text-red-500"
                  )}>
                    {event.type === 'inflow' ? '+' : '-'}${event.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 