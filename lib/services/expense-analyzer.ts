import OpenAI from 'openai';
import { extractBankStatementInfo } from './openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function calculateExpenseMetrics(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a precise financial calculator. Follow these exact steps:
          1. Look for lines with negative amounts in the Amount column
          2. Exclude any lines where Category is "Balance"
          3. For each negative amount:
             - Remove any commas
             - Convert to a positive number
             - Add to the total
          4. Count the number of unique dates that have transactions (excluding Balance entries)
          5. Calculate daily average by dividing total by number of days
          Be extremely precise and consistent with calculations.`
        },
        {
          role: "user",
          content: `Given this bank statement:
          1. Sum ALL negative amounts in the Amount column (excluding Balance entries)
          2. Make the sum positive
          3. Count unique dates with actual transactions
          4. Calculate daily average
          
          Example calculation:
          If amounts are: -150.50, -9.99, -120.75, -15.99 (etc.)
          Total should be: 150.50 + 9.99 + 120.75 + 15.99 (etc.)
          
          Return this exact JSON:
          {
            "monthlySpending": [total of all negative amounts as positive number],
            "averageDaily": [monthlySpending divided by unique transaction dates],
            "daysInStatement": [count of unique dates with transactions]
          }

          Statement:
          ${statementContent}`
        }
      ],
      temperature: 0
    });

    const content = response.choices[0].message.content;
    console.log('Raw OpenAI Response:', content);

    if (!content) throw new Error('No content in response');

    // Clean the response
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Cleaned content:', cleanContent);

    const result = JSON.parse(cleanContent);
    
    // Validate the expected values
    if (!result.monthlySpending || !result.averageDaily || !result.daysInStatement) {
      throw new Error('Invalid metrics data');
    }

    // Manual verification of the calculation
    const expectedValues = {
      monthlySpending: 3667.84,
      averageDaily: 193.04,
      daysInStatement: 19
    };

    console.log('Verification:', {
      received: {
        monthlySpending: result.monthlySpending,
        averageDaily: result.averageDaily,
        daysInStatement: result.daysInStatement
      },
      expected: expectedValues,
      difference: {
        monthlySpending: Math.abs(result.monthlySpending - expectedValues.monthlySpending),
        averageDaily: Math.abs(result.averageDaily - expectedValues.averageDaily),
        daysInStatement: Math.abs(result.daysInStatement - expectedValues.daysInStatement)
      }
    });

    // Round to 2 decimal places
    return {
      monthlySpending: Math.round(parseFloat(result.monthlySpending) * 100) / 100,
      averageDaily: Math.round(parseFloat(result.averageDaily) * 100) / 100,
      daysInStatement: parseInt(result.daysInStatement)
    };
  } catch (error) {
    console.error('Error calculating expense metrics:', error);
    return {
      monthlySpending: 0,
      averageDaily: 0,
      daysInStatement: 0
    };
  }
}

export async function calculateCategorySpending(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a precise financial calculator. Follow these exact steps:
          1. Group all negative amounts by their Category
          2. For each category:
             - Sum the absolute values of negative amounts
             - Calculate percentage of total spending
          3. Sort categories by spending amount (highest first)
          Return exact calculations with amounts and percentages.`
        },
        {
          role: "user",
          content: `Given this bank statement:
          1. Find all transactions with negative amounts
          2. Group them by Category
          3. Calculate total for each category
          4. Calculate percentage of total spending
          
          Return this exact JSON:
          {
            "categories": [
              {
                "name": "category name",
                "value": total amount as positive number,
                "percentage": percentage of total spending
              }
            ],
            "totalSpending": total of all negative amounts
          }

          Statement:
          ${statementContent}`
        }
      ],
      temperature: 0
    });

    const content = response.choices[0].message.content;
    console.log('Raw Category Analysis:', content);

    if (!content) throw new Error('No content in response');

    // Clean the response
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanContent);
    
    if (!result.categories || !Array.isArray(result.categories)) {
      throw new Error('Invalid category data');
    }

    // Round all numbers to 2 decimal places
    return {
      categories: result.categories.map((cat: any) => ({
        name: cat.name,
        value: Math.round(parseFloat(cat.value) * 100) / 100,
        percentage: Math.round(parseFloat(cat.percentage) * 100) / 100
      })),
      totalSpending: Math.round(parseFloat(result.totalSpending) * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating category spending:', error);
    return {
      categories: [],
      totalSpending: 0
    };
  }
}

export async function calculateMonthlyTrends(statementContent: string) {
  try {
    // Get the stored bank info which has the correct period
    const bankInfo = await extractBankStatementInfo(statementContent);
    console.log('Bank Statement Info for Trends:', bankInfo);

    // Get the monthly spending from the metrics we already calculated
    const metrics = await calculateExpenseMetrics(statementContent);

    // Get the month abbreviation properly
    const monthMap: { [key: string]: string } = {
      'January': 'Jan',
      'February': 'Feb',
      'March': 'Mar',
      'April': 'Apr',
      'May': 'May',
      'June': 'Jun',
      'July': 'Jul',
      'August': 'Aug',
      'September': 'Sep',
      'October': 'Oct',
      'November': 'Nov',
      'December': 'Dec'
    };

    const monthAbbrev = monthMap[bankInfo.period.month] || bankInfo.period.month.slice(0, 3);

    // Create the trend data using the period info from bank statement
    const trends = [{
      month: monthAbbrev,  // Will be "Aug" for August
      amount: metrics.monthlySpending,
      color: '#FF6B6B'
    }];

    console.log('Final processed trends:', trends);
    return trends;
  } catch (error) {
    console.error('Error calculating monthly trends:', error);
    return [];
  }
}

export async function getRecentTransactions(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Extract the most recent transactions from the bank statement.
          For each transaction:
          1. Get the date, description, category, and amount
          2. Format negative amounts as expenses (keep negative)
          3. Sort by date (most recent first)
          Return only transactions with actual amounts (exclude Balance entries).`
        },
        {
          role: "user",
          content: `Return this exact JSON:
          {
            "transactions": [
              {
                "date": "YYYY-MM-DD",
                "description": "transaction description",
                "category": "category name",
                "amount": number (negative for expenses, positive for income)
              }
            ]
          }

          Statement:
          ${statementContent}`
        }
      ],
      temperature: 0
    });

    const content = response.choices[0].message.content;
    console.log('Raw Transactions Response:', content);

    if (!content) throw new Error('No content in response');

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanContent);
    
    if (!result.transactions || !Array.isArray(result.transactions)) {
      throw new Error('Invalid transactions data');
    }

    // Format and sort transactions
    const formattedTransactions = result.transactions
      .filter((t: any) => t.amount !== 0)
      .map((t: any) => ({
        date: new Date(t.date).toISOString(),
        description: t.description,
        category: t.category,
        amount: Math.round(parseFloat(t.amount) * 100) / 100
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return formattedTransactions;
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
}

export async function detectAnomalies(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze the bank statement for unusual patterns:
          1. Look for unusually high expenses in any category
          2. Find potential duplicate transactions
          3. Identify savings opportunities
          4. Compare amounts to typical ranges
          Return only the most significant anomalies.`
        },
        {
          role: "user",
          content: `Analyze this statement for anomalies and return this exact JSON:
          {
            "anomalies": [
              {
                "title": "brief description",
                "description": "detailed explanation",
                "type": "warning" | "success" | "error",
                "amount": "amount with $ sign",
                "category": "category name"
              }
            ]
          }

          Statement:
          ${statementContent}`
        }
      ],
      temperature: 0
    });

    const content = response.choices[0].message.content;
    console.log('Raw Anomalies Response:', content);

    if (!content) throw new Error('No content in response');

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanContent);
    
    if (!result.anomalies || !Array.isArray(result.anomalies)) {
      throw new Error('Invalid anomalies data');
    }

    return result.anomalies;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return [];
  }
} 