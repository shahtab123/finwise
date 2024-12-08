'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, X, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { UploadedDocuments } from "@/components/upload/UploadedDocuments"
import { extractBankStatementInfo, analyzeTransactions } from "@/lib/services/openai"
import * as XLSX from 'xlsx'

interface UploadFile {
  id: string;
  fileName: string;
  bankName: string;
  month: string;
  year: number;
  amount: number;
  uploadDate: Date;
  status: 'processed' | 'pending' | 'failed';
}

const LOCAL_STORAGE_KEY = 'finwise_documents';
const TRANSACTIONS_KEY = 'finwise_transactions';

export default function UploadPage() {
  const [documents, setDocuments] = useState<UploadFile[]>([])
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    const localDocs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localDocs) {
      try {
        const parsedDocs = JSON.parse(localDocs);
        setDocuments(parsedDocs.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate)
        })));
        const total = parsedDocs.reduce((sum: number, doc: any) => sum + doc.amount, 0);
        setTotalBalance(total);
      } catch (error) {
        console.error('Error parsing local documents:', error);
      }
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Immediately add files to the table with 'pending' status
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      bankName: 'Processing...',
      month: 'Processing...',
      year: new Date().getFullYear(),
      amount: 0,
      uploadDate: new Date(),
      status: 'pending' as const
    }));

    // Add to documents immediately and save to localStorage
    setDocuments(prev => {
      const updated = [...prev, ...newFiles];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Process each file in the background
    newFiles.forEach(async (newFile, index) => {
      try {
        const file = acceptedFiles[index];
        let content = '';
        
        // Read file content
        if (['xlsx', 'xls'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }

        // Process with OpenAI in parallel
        const [result, transactions] = await Promise.all([
          extractBankStatementInfo(content),
          analyzeTransactions(content)
        ]);

        // Calculate metrics
        const negativeTransactions = transactions.filter(t => parseFloat(t.amount) < 0);
        const monthlySpending = negativeTransactions.reduce((sum, t) => 
          sum + Math.abs(parseFloat(t.amount)), 0
        );
        const daysInStatement = new Set(transactions.map(t => new Date(t.date).getDate())).size;
        const averageDaily = monthlySpending / daysInStatement;

        // Store metrics along with the statement
        localStorage.setItem('finwise_latest_statement', content);
        localStorage.setItem('finwise_metrics', JSON.stringify({
          monthlySpending,
          averageDaily
        }));

        // Format transactions with proper date and amount
        const formattedTransactions = transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date).toISOString(), // Ensure proper date format
          amount: parseFloat(String(t.amount).replace(/[^0-9.-]+/g, "")), // Ensure proper number format
          category: t.category || 'Uncategorized'
        }));

        // Store transactions with proper formatting
        const existingTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
        const updatedTransactions = [...existingTransactions, ...formattedTransactions];
        
        // Sort transactions by date
        updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
        
        // Dispatch a custom event to notify the ExpensesList
        window.dispatchEvent(new CustomEvent('transactionsUpdated'));

        // Update document with results
        setDocuments(prev => {
          const updated = prev.map(doc => 
            doc.id === newFile.id ? {
              ...doc,
              bankName: result.bankName || 'Unknown Bank',
              month: result.period?.month || 'Unknown',
              year: result.period?.year || new Date().getFullYear(),
              amount: parseFloat(String(result.totalBalance || '0').replace(/[^0-9.-]+/g, "") || '0'),
              status: 'processed' as const
            } : doc
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        // Update total balance
        setTotalBalance(prev => prev + parseFloat(String(result.totalBalance || '0').replace(/[^0-9.-]+/g, "") || '0'));

      } catch (error) {
        console.error('Error processing file:', error);
        // Update document status to failed
        setDocuments(prev => {
          const updated = prev.map(doc => 
            doc.id === newFile.id ? {
              ...doc,
              status: 'failed' as const
            } : doc
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt']
    }
  });

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc) {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setTotalBalance(current => current - doc.amount);
        return updated;
      }
      return prev;
    });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Bank Statements</CardTitle>
            <CardDescription>
              Upload your Excel or Text files to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors",
                "hover:border-primary/50 hover:bg-secondary/50",
                isDragActive && "border-primary bg-secondary/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop files here" : "Drag files here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Support for Excel (.xlsx, .xls) and Text (.txt) files
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <UploadedDocuments 
          documents={documents}
          totalBalance={totalBalance}
          onDelete={removeDocument}
        />
      </div>
    </div>
  );
} 