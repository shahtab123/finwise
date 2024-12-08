import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeSubscriptions(statementContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze bank statement for subscriptions and calculate savings:
          1. Identify recurring payments and subscriptions
          2. Calculate monthly and annual costs
          3. For each subscription, analyze potential savings:
             - Annual vs monthly billing (usually 15-20% savings)
             - Family/group plans (usually 30-50% per person)
             - Bundle opportunities (usually 20-30% savings)
             - Available discounts (student, senior, etc. 10-50%)
             - Alternative plans or services (varying savings)
          4. Sum up all potential savings
          Be specific with savings amounts and recommendations.`
        },
        {
          role: "user",
          content: `Analyze this statement and return this exact JSON:
          {
            "subscriptions": [
              {
                "name": "service name",
                "status": "active",
                "billingCycle": "monthly" or "annual",
                "amount": monthly amount as number,
                "managementUrl": "url to manage subscription",
                "isUnused": boolean,
                "optimizationTip": "specific tip for this service",
                "potentialSaving": number (monthly savings amount)
              }
            ],
            "totalMonthly": total monthly cost as number,
            "totalAnnual": total annual cost as number,
            "potentialSavings": sum of all potential savings as number,
            "unusedCount": number of unused subscriptions,
            "optimizationTips": [
              {
                "title": "specific saving opportunity",
                "description": "detailed explanation with exact numbers",
                "savingAmount": exact monthly saving amount as number,
                "category": "Bundle" | "Family Plan" | "Annual Savings" | "Alternative" | "Usage" | "Promotion"
              }
            ]
          }

          Example tip:
          {
            "title": "Switch Netflix to Annual Plan",
            "description": "Save $35.88/year by switching to annual billing",
            "savingAmount": 2.99,
            "category": "Annual Savings"
          }

          Statement:
          ${statementContent}`
        }
      ],
      temperature: 0
    });

    const content = response.choices[0].message.content;
    console.log('Raw Subscription Analysis:', content);

    if (!content) throw new Error('No content in response');

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanContent);
    
    if (!result.subscriptions || !Array.isArray(result.subscriptions)) {
      throw new Error('Invalid subscription data');
    }

    // Ensure all numbers are properly formatted
    return {
      ...result,
      subscriptions: result.subscriptions.map((sub: any) => ({
        ...sub,
        amount: parseFloat(sub.amount),
        potentialSaving: parseFloat(sub.potentialSaving || 0)
      })),
      totalMonthly: parseFloat(result.totalMonthly),
      totalAnnual: parseFloat(result.totalAnnual),
      potentialSavings: parseFloat(result.potentialSavings),
      unusedCount: parseInt(result.unusedCount),
      optimizationTips: result.optimizationTips?.map((tip: any) => ({
        ...tip,
        savingAmount: parseFloat(tip.savingAmount)
      })) || []
    };
  } catch (error) {
    console.error('Error analyzing subscriptions:', error);
    return {
      subscriptions: [],
      totalMonthly: 0,
      totalAnnual: 0,
      potentialSavings: 0,
      unusedCount: 0,
      optimizationTips: []
    };
  }
} 