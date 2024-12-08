'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscriptionListProps {
  subscriptions: any[];
  onToggleUnused?: (index: number, isUnused: boolean) => void;
}

export function SubscriptionList({ subscriptions, onToggleUnused }: SubscriptionListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Billing Cycle</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Unused</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub, index) => (
          <TableRow 
            key={index}
            className={cn(
              sub.isUnused && "bg-yellow-500/5"
            )}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="font-medium">{sub.name}</div>
                {sub.optimizationTip && sub.potentialSaving > 0 && (
                  <Badge variant="outline" className="text-primary">
                    Has Tip
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Active</span>
              </div>
            </TableCell>
            <TableCell className="capitalize">{sub.billingCycle}</TableCell>
            <TableCell>${sub.amount.toFixed(2)}/mo</TableCell>
            <TableCell>
              <input
                type="checkbox"
                checked={sub.isUnused}
                onChange={(e) => {
                  onToggleUnused?.(index, e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => window.open(sub.managementUrl, '_blank')}
                >
                  Manage
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 