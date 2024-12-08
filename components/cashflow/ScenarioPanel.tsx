'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Scenario } from "@/lib/services/cashflow-manager"
import { cn } from "@/lib/utils"

interface ScenarioPanelProps {
  scenario: Scenario
  onScenarioChange: (scenario: Scenario) => void
  timeframe: number
  onTimeframeChange: (months: number) => void
  isSimulating: boolean
}

export function ScenarioPanel({
  scenario,
  onScenarioChange,
  timeframe,
  onTimeframeChange,
  isSimulating
}: ScenarioPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Settings</CardTitle>
          <CardDescription>Adjust forecast parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Forecast Scenario</h4>
            <div className="grid gap-2">
              <Button
                variant={scenario === 'baseline' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => onScenarioChange('baseline')}
              >
                <div className="flex flex-col items-start">
                  <span>Baseline</span>
                  <span className="text-xs text-muted-foreground">
                    Current trends continue
                  </span>
                </div>
              </Button>
              <Button
                variant={scenario === 'optimistic' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => onScenarioChange('optimistic')}
              >
                <div className="flex flex-col items-start">
                  <span>Optimistic</span>
                  <span className="text-xs text-muted-foreground">
                    10% increase in revenue
                  </span>
                </div>
              </Button>
              <Button
                variant={scenario === 'pessimistic' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => onScenarioChange('pessimistic')}
              >
                <div className="flex flex-col items-start">
                  <span>Pessimistic</span>
                  <span className="text-xs text-muted-foreground">
                    10% decrease in revenue
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Forecast Period</h4>
              <span className="text-sm text-muted-foreground">
                {timeframe} months
              </span>
            </div>
            <Slider
              value={[timeframe]}
              onValueChange={([value]) => onTimeframeChange(value)}
              min={3}
              max={24}
              step={3}
              className="w-full"
            />
          </div>

          {/* Simulation Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Real-time Simulation</h4>
              <Switch
                checked={isSimulating}
                onCheckedChange={() => {}}
                disabled
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Simulate market conditions and business events in real-time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common adjustments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={!isSimulating}
          >
            Add Revenue Spike
            <Badge variant="outline">+25%</Badge>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={!isSimulating}
          >
            Add Major Expense
            <Badge variant="outline">-$5,000</Badge>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={!isSimulating}
          >
            Simulate Market Downturn
            <Badge variant="outline">-15%</Badge>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 