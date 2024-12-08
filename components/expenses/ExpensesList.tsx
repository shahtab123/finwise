'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"

interface Transaction {
  id?: string
  date: Date
  description: string
  category: string
  amount: number
  type: 'credit' | 'debit'
}

interface ExpensesListProps {
  category?: string | null
}

const TRANSACTIONS_KEY = 'finwise_transactions';

export function ExpensesList({ category }: ExpensesListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Function to load transactions
  const loadTransactions = useCallback(() => {
    const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    if (storedTransactions) {
      try {
        const parsed = JSON.parse(storedTransactions);
        const processedTransactions = parsed.map((t: any, index: number) => ({
          id: t.id || `trans-${index}`,
          date: new Date(t.date),
          description: t.description,
          category: t.category,
          amount: parseFloat(t.amount),
          type: t.type || (parseFloat(t.amount) < 0 ? 'debit' : 'credit')
        }));
        setTransactions(processedTransactions);
      } catch (error) {
        console.error('Error parsing transactions:', error);
      }
    }
  }, []);

  // Load transactions initially
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Add storage event listener to update when transactions change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TRANSACTIONS_KEY) {
        loadTransactions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadTransactions]);

  const filteredTransactions = category
    ? transactions.filter(t => t.category === category)
    : transactions;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(transaction.date, 'MMM d, yyyy')}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{transaction.category}</Badge>
              </TableCell>
              <TableCell className={cn(
                "text-right",
                transaction.type === 'credit' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {transaction.type === 'debit' ? '-' : '+'}
                ${Math.abs(transaction.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
} 