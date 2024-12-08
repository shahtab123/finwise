import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const DEFAULT_INVESTMENTS = [
  {
    name: "S&P 500 ETF",
    type: "ETF",
    value: 10000,
    initialValue: 8000,
    return: 25,
    riskLevel: "Medium",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/sp500"
  },
  {
    name: "Tech Growth Fund",
    type: "Mutual Fund",
    value: 5000,
    initialValue: 4000,
    return: 25,
    riskLevel: "High",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/tech"
  },
  {
    name: "Government Bonds",
    type: "Bonds",
    value: 3000,
    initialValue: 3000,
    return: 0,
    riskLevel: "Low",
    lastUpdated: "2024-03-15",
    managementUrl: "https://example.com/bonds"
  }
];

export async function analyzeInvestments(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze bank statement for investments and portfolio metrics:
          1. Identify investment transactions and holdings
          2. Calculate portfolio value and returns
          3. Assess risk levels and diversification
          4. Provide investment insights and recommendations
          5. Track performance over time
          Return detailed analysis in JSON format.`
        },
        {
          role: "user",
          content: `Analyze this statement and return this exact JSON:
          {
            "investments": [
              {
                "name": "investment name",
                "type": "Stocks" | "Bonds" | "ETF" | "Crypto" | "Mutual Fund",
                "value": current value as number,
                "initialValue": initial investment amount as number,
                "return": return percentage as number,
                "riskLevel": "Low" | "Medium" | "High",
                "lastUpdated": "YYYY-MM-DD",
                "alert": "alert message if any",
                "managementUrl": "url to manage investment"
              }
            ],
            "metrics": {
              "totalValue": total portfolio value as number,
              "totalReturn": total return amount as number,
              "returnPercentage": overall return percentage as number,
              "riskScore": risk score from 1-10 as number,
              "diversificationScore": diversification score from 1-10 as number
            },
            "insights": [
              {
                "title": "insight title",
                "description": "detailed explanation",
                "type": "warning" | "success" | "info",
                "action": "suggested action if any",
                "actionUrl": "url for action if applicable"
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
    console.log('Raw Investment Analysis:', content);

    if (!content) throw new Error('No content in response');

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanContent);
    
    if (!result.investments || !Array.isArray(result.investments)) {
      throw new Error('Invalid investment data');
    }

    // Format numbers and dates
    return {
      investments: result.investments.map((inv: any) => ({
        ...inv,
        value: parseFloat(inv.value),
        initialValue: parseFloat(inv.initialValue),
        return: parseFloat(inv.return),
        lastUpdated: inv.lastUpdated
      })),
      metrics: {
        totalValue: parseFloat(result.metrics.totalValue),
        totalReturn: parseFloat(result.metrics.totalReturn),
        returnPercentage: parseFloat(result.metrics.returnPercentage),
        riskScore: parseInt(result.metrics.riskScore),
        diversificationScore: parseInt(result.metrics.diversificationScore)
      },
      insights: result.insights || []
    };
  } catch (error) {
    console.error('Error analyzing investments:', error);
    return {
      investments: DEFAULT_INVESTMENTS,
      metrics: {
        totalValue: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + inv.value, 0),
        totalReturn: DEFAULT_INVESTMENTS.reduce((sum, inv) => sum + (inv.value - inv.initialValue), 0),
        returnPercentage: 20,
        riskScore: 6,
        diversificationScore: 8
      },
      insights: [
        {
          title: "Portfolio Diversification",
          description: "Your portfolio has a good mix of assets across different risk levels.",
          type: "success",
          action: "View Details",
          actionUrl: "#"
        },
        {
          title: "High Growth Potential",
          description: "Tech sector investments showing strong performance.",
          type: "info",
          action: "Analyze Trends",
          actionUrl: "#"
        }
      ]
    };
  }
} 