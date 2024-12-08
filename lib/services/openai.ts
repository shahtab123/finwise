import OpenAI from 'openai';
import { calculateExpenseMetrics } from './expense-analyzer';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function extractBankStatementInfo(fileContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a bank statement analyzer. Look for:
            1. Bank name at the top of the statement
            2. The last date in the statement for period
            3. The final balance (last row's Balance amount)
            Return only valid JSON with exact values found.`
        },
        {
          role: "user",
          content: `Find these exact values in the bank statement and return as JSON:
            1. Bank name (shown at the very top)
            2. Last transaction date (from the Date column)
            3. Final balance (the last Balance amount)

            Return ONLY this JSON structure with the exact values found:
            {
              "bankName": "exact bank name from top",
              "period": {
                "month": "month from last date",
                "year": year from last date as number
              },
              "totalBalance": final balance amount as number
            }

            Bank Statement Content:
            ${fileContent}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    console.log('Raw Statement Content:', fileContent);
    console.log('OpenAI Response:', content);

    try {
      if (!content?.trim().startsWith('{')) {
        throw new Error('Invalid JSON response');
      }
      
      const result = JSON.parse(content);
      
      if (!result.bankName || !result.period || !result.totalBalance) {
        throw new Error('Missing required fields in response');
      }

      return {
        bankName: result.bankName,
        period: {
          month: result.period.month,
          year: result.period.year
        },
        totalBalance: result.totalBalance
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        bankName: 'Unknown Bank',
        period: {
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear()
        },
        totalBalance: 0
      };
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

export const analyzeTransactions = async (fileContent: string) => {
  try {
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a financial data analyzer. Extract transactions from the provided bank statement and return them in a structured JSON format. 
          Return ONLY a JSON object with a 'transactions' array containing objects with these exact fields:
          {
            "transactions": [
              {
                "date": "YYYY-MM-DD",
                "description": "transaction description",
                "amount": number (negative for expenses, positive for income),
                "category": "category name"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Extract transactions from this statement: ${fileContent}`
        }
      ],
      temperature: 0
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) throw new Error('No content in response');

    // Parse the response content as JSON
    const result = JSON.parse(responseContent);
    
    // Validate and format the transactions
    if (!result.transactions || !Array.isArray(result.transactions)) {
      throw new Error('Invalid transaction data format');
    }

    return result.transactions.map((t: any) => ({
      date: new Date(t.date).toISOString(),
      description: t.description,
      amount: parseFloat(String(t.amount).replace(/[^0-9.-]+/g, "")),
      category: t.category || 'Uncategorized'
    }));
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    return [];
  }
};

export async function analyzeExpenseMetrics(fileContent: string) {
  try {
    // Get current balance from documents
    const documents = JSON.parse(localStorage.getItem('finwise_documents') || '[]');
    const processedDocs = documents.filter((doc: any) => doc.status === 'processed');
    const currentBalance = processedDocs.reduce((sum: number, doc: any) => sum + doc.amount, 0);

    // Calculate expense metrics using the dedicated service
    const metrics = await calculateExpenseMetrics(fileContent);

    // For single statement, don't show percentage changes
    const hasMultipleStatements = processedDocs.length > 1;

    return {
      currentBalance,
      monthlySpending: metrics.monthlySpending,
      averageDaily: metrics.averageDaily,
      hasMultipleStatements
    };
  } catch (error) {
    console.error('Error analyzing expense metrics:', error);
    
    // Return current balance even if analysis fails
    try {
      const documents = JSON.parse(localStorage.getItem('finwise_documents') || '[]');
      const currentBalance = documents
        .filter((doc: any) => doc.status === 'processed')
        .reduce((sum: number, doc: any) => sum + doc.amount, 0);

      return {
        currentBalance,
        monthlySpending: 0,
        averageDaily: 0,
        hasMultipleStatements: false
      };
    } catch (docError) {
      return {
        currentBalance: 0,
        monthlySpending: 0,
        averageDaily: 0,
        hasMultipleStatements: false
      };
    }
  }
} 