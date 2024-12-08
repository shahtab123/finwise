export type Scenario = 'baseline' | 'optimistic' | 'pessimistic';

export interface CashFlowEvent {
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  description: string;
  category: string;
}

export interface TimelineData {
  date: string;
  inflows: number;
  outflows: number;
  balance: number;
  events: CashFlowEvent[];
}

export interface WaterfallData {
  name: string;
  inflow: number;
  outflow: number;
  balance: number;
  cumulative: number;
}

export interface Alert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
}

export interface CashFlowData {
  currentBalance: number;
  projectedBalance: number;
  minimumRequired: number;
  totalInflows: number;
  totalOutflows: number;
  growthRate: number;
  timeline: TimelineData[];
  waterfall: WaterfallData[];
  alerts: Alert[];
}

function generateTimelineData(months: number, scenario: Scenario): TimelineData[] {
  const data: TimelineData[] = [];
  const currentDate = new Date();
  const multiplier = scenario === 'optimistic' ? 1.1 : scenario === 'pessimistic' ? 0.9 : 1;

  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const inflows = Math.floor(Math.random() * 20000 + 30000) * multiplier;
    const outflows = Math.floor(Math.random() * 15000 + 25000);
    const balance = inflows - outflows;

    data.push({
      date: date.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
      inflows,
      outflows,
      balance,
      events: [
        {
          date: date.toISOString(),
          amount: inflows * 0.8,
          type: 'inflow',
          description: 'Monthly Revenue',
          category: 'Sales'
        },
        {
          date: date.toISOString(),
          amount: outflows * 0.6,
          type: 'outflow',
          description: 'Operating Expenses',
          category: 'Operations'
        }
      ]
    });
  }

  return data;
}

function generateWaterfallData(timeline: TimelineData[]): WaterfallData[] {
  let cumulative = 0;
  return timeline.map((item) => {
    cumulative += (item.inflows - item.outflows);
    return {
      name: item.date,
      inflow: item.inflows,
      outflow: item.outflows,
      balance: item.balance,
      cumulative
    };
  });
}

function generateAlerts(data: { timeline: TimelineData[], waterfall: WaterfallData[] }): Alert[] {
  const alerts: Alert[] = [];

  // Check for negative balance
  const negativeMonths = data.timeline.filter(month => month.balance < 0);
  if (negativeMonths.length > 0) {
    alerts.push({
      type: 'danger',
      title: 'Negative Cash Flow Detected',
      description: `${negativeMonths.length} month(s) show negative cash flow. Consider reducing expenses or increasing revenue.`
    });
  }

  // Check for declining trend
  const lastThreeMonths = data.timeline.slice(-3);
  const isDecreasing = lastThreeMonths.every((month, i) => 
    i === 0 || month.balance < lastThreeMonths[i - 1].balance
  );
  if (isDecreasing) {
    alerts.push({
      type: 'warning',
      title: 'Declining Cash Flow Trend',
      description: 'Cash flow has been decreasing for the last 3 months. Review your financial strategy.'
    });
  }

  // Add positive alerts
  if (data.waterfall[data.waterfall.length - 1].cumulative > 0) {
    alerts.push({
      type: 'info',
      title: 'Positive Cash Position',
      description: 'Your projected cash position remains positive throughout the forecast period.'
    });
  }

  return alerts;
}

export function generateCashFlowData(months: number, scenario: Scenario): CashFlowData {
  const timeline = generateTimelineData(months, scenario);
  const waterfall = generateWaterfallData(timeline);
  const currentBalance = 50000;
  const minimumRequired = 25000;

  const totalInflows = timeline.reduce((sum, month) => sum + month.inflows, 0);
  const totalOutflows = timeline.reduce((sum, month) => sum + month.outflows, 0);
  const projectedBalance = currentBalance + (totalInflows - totalOutflows);
  const growthRate = ((projectedBalance - currentBalance) / currentBalance) * 100;

  return {
    currentBalance,
    projectedBalance,
    minimumRequired,
    totalInflows,
    totalOutflows,
    growthRate,
    timeline,
    waterfall,
    alerts: generateAlerts({ timeline, waterfall })
  };
} 