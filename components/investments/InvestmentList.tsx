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
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InvestmentListProps {
  investments: any[]
}

export function InvestmentList({ investments }: InvestmentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Return</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investments.map((investment, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="font-medium">{investment.name}</div>
                {investment.alert && (
                  <Badge variant="outline" className="text-yellow-500">
                    {investment.alert}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="capitalize">{investment.type}</TableCell>
            <TableCell>${investment.value.toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {investment.return >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">+{investment.return}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{investment.return}%</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <AlertCircle className={cn(
                  "h-4 w-4",
                  investment.riskLevel === 'High' && "text-red-500",
                  investment.riskLevel === 'Medium' && "text-yellow-500",
                  investment.riskLevel === 'Low' && "text-emerald-500"
                )} />
                <span>{investment.riskLevel}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => window.open(investment.managementUrl, '_blank')}
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