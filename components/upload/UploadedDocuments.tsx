'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { Document } from "@/lib/db/schema"

interface UploadedDocumentsProps {
  documents: Document[]
  totalBalance: number
  onDelete?: (id: string) => void
}

export function UploadedDocuments({ documents, totalBalance, onDelete }: UploadedDocumentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Statements Overview</CardTitle>
            <CardDescription>Current balance and recent statements</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold text-primary">${totalBalance.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statement</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{doc.fileName}</span>
                  </div>
                </TableCell>
                <TableCell>{doc.bankName || 'N/A'}</TableCell>
                <TableCell>
                  {doc.month} {doc.year}
                </TableCell>
                <TableCell>${doc.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.status === 'processed' 
                        ? 'success' 
                        : doc.status === 'pending' 
                        ? 'warning' 
                        : 'destructive'
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(doc.uploadDate, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-red-500"
                      onClick={() => onDelete?.(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 