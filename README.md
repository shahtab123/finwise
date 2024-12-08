# FinWise - Financial Management System

Created for Soario X Karmeq: Apps for Finance Hackathon

A comprehensive financial management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 1. Document Management
- Upload bank statements (Excel, CSV, TXT)
- Automatic data extraction and processing
- Transaction categorization using AI
- Document storage and management
- Export financial reports as PDF

### 2. Expense Tracking
- Automatic transaction categorization
- Spending analytics and trends
- Category-wise breakdown
- Custom expense categories
- Visual expense reports
- Monthly spending insights

### 3. Subscription Management
- Track recurring payments
- Subscription analytics
- Cost optimization suggestions
- Renewal reminders
- Spending trends analysis
- Cancellation tracking

### 4. Investment Portfolio
- Portfolio overview
- Investment tracking
- Performance analytics
- Risk assessment
- Asset allocation
- Investment insights

### 5. Budget Planning
- Create custom budgets
- Category-wise budget allocation
- Budget vs actual tracking
- Visual budget analytics
- Spending alerts
- Budget recommendations

### 6. Cash Flow Forecasting
- Future cash flow predictions
- Scenario analysis
- Revenue forecasting
- Expense projections
- Interactive visualizations
- Trend analysis

### 7. Profit & Loss Statements
- Automated P&L generation
- Revenue tracking
- Expense categorization
- Margin analysis
- Period comparisons
- Export capabilities

### 8. Payroll Management
- Employee database
- Salary processing
- Tax calculations
- Reimbursement tracking
- Department budgets
- Payroll reports

### 9. Vendor Management
- Vendor database
- Payment tracking
- Contract management
- Vendor performance
- Spending analytics
- Payment scheduling

### 10. Loan Management
- Loan portfolio tracking
- Payment scheduling
- Interest calculations
- Loan comparison
- Amortization schedules
- Payment reminders

## AI-Powered Features (OpenAI Integration)

### 1. Upload Bank Statements
In `/lib/services/openai.ts`:
```typescript
extractBankStatementInfo(fileContent: string)
```
- **Purpose**: Processes uploaded bank statements
- **Model**: GPT-4
- **Features**:
  - Extracts transaction data
  - Identifies bank details
  - Detects statement period
  - Validates account information
  - Standardizes data format
- **Implementation**:
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a bank statement analyzer. Look for:
          1. Bank name at the top of the statement
          2. Account holder information
          3. Transaction details
          4. Balance information
          5. Statement period`
      },
      { role: "user", content: fileContent }
    ]
  });
  ```

### 2. Expense Analysis
In `/lib/services/expense-analyzer.ts`:
```typescript
calculateExpenseMetrics(statementContent: string)
```
- **Purpose**: Analyzes spending patterns
- **Model**: GPT-3.5 Turbo
- **Features**:
  - Automatic categorization
  - Spending pattern detection
  - Anomaly identification
  - Budget recommendations
  - Trend analysis
- **Implementation**:
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a precise financial calculator. Follow these steps:
          1. Look for lines with negative amounts
          2. Categorize each transaction
          3. Calculate category totals
          4. Identify patterns
          5. Flag anomalies`
      }
    ]
  });
  ```

### 3. Subscription Management
In `/lib/services/subscription-analyzer.ts`:
```typescript
analyzeSubscriptions(statementContent: string)
```
- **Purpose**: Manages recurring payments
- **Model**: GPT-3.5 Turbo
- **Features**:
  - Identifies recurring charges
  - Calculates monthly costs
  - Suggests optimizations
  - Detects duplicate subscriptions
  - Provides cancellation insights
- **Implementation**:
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Analyze bank statement for subscriptions and calculate savings:
          1. Identify recurring payments
          2. Calculate monthly costs
          3. Find potential duplicates
          4. Suggest optimizations
          5. Estimate potential savings`
      }
    ]
  });
  ```



### API Configuration
```typescript
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
```


### Error Handling
```typescript
try {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [...]
  });
} catch (error) {
  console.error('OpenAI API Error:', error);
  return {
    success: false,
    error: 'Failed to process document'
  };
}
```

### Performance Considerations
- Batch processing for large documents
- Response caching
- Rate limiting implementation
- Error retry logic
- Timeout handling

### Security Measures
- API key protection
- Data sanitization
- Input validation
- Error message sanitization
- Secure data storage

### Future Improvements
1. **Model Optimization**
   - Fine-tuning for financial data
   - Custom model training
   - Response optimization

2. **Feature Expansion**
   - Multi-language support
   - Additional document types
   - Enhanced analytics
   - Real-time processing

3. **Integration Options**
   - Additional AI providers
   - Banking APIs
   - Financial data providers
   - Export capabilities

4. **Mobile Experience**
   - Native mobile apps (iOS/Android)
   - Mobile-optimized UI
   - Offline functionality
   - Push notifications

5. **Advanced Analytics**
   - Predictive financial modeling
   - Machine learning insights
   - Custom reporting tools
   - Advanced data visualization

6. **Security Enhancements**
   - Two-factor authentication
   - Biometric login
   - End-to-end encryption
   - Audit logging

7. **Collaboration Features**
   - Multi-user access
   - Team permissions
   - Shared dashboards
   - Activity tracking

8. **Automation Tools**
   - Automated reconciliation
   - Scheduled reports
   - Smart alerts
   - Batch processing

9. **Tax Management**
   - Tax calculation
   - Deduction tracking
   - Tax document generation
   - Filing assistance

10. **Compliance Tools**
    - Regulatory reporting
    - Compliance monitoring
    - Policy enforcement
    - Audit trails

11. **Data Integration**
    - Direct bank feeds
    - Credit card integration
    - Investment account sync
    - Cryptocurrency tracking

12. **Document Management**
    - OCR improvements
    - Digital signatures
    - Document versioning
    - Automated filing

13. **Reporting Enhancements**
    - Custom report builder
    - Interactive dashboards
    - Dynamic charts
    - Export formats

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/finwise.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   - Get your API key from [OpenAI's dashboard](https://platform.openai.com/api-keys)
   - Add your OpenAI API key to `.env.local`:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```
   
   ⚠️ **Important Security Notes**:
   - Never commit your actual API key to version control
   - Keep your `.env.local` file in your `.gitignore`
   - If you accidentally exposed your API key, rotate it immediately in your OpenAI dashboard
   - The API key should start with "sk-"

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **AI Integration**: OpenAI GPT-4
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Data Validation**: Zod

## Project Structure

```
finwise/
├── app/                    # Next.js pages and routing
│   ├── budget/            # Budget planning module
│   ├── cashflow/          # Cash flow forecasting
│   ├── expenses/          # Expense tracking
│   ├── investments/       # Investment portfolio
│   ├── loans/             # Loan management
│   ├── payroll/           # Payroll & expenses
│   ├── profit-loss/       # P&L statements
│   ├── settings/          # User settings
│   ├── subscriptions/     # Subscription management
│   ├── upload/            # Document upload
│   ├── vendors/           # Vendor management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
│
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── dashboard/        # Dashboard components
│   │   ├── Charts.tsx
│   │   └── Sidebar.tsx
│   ├── budget/           # Budget module components
│   ├── expenses/         # Expense module components
│   ├── investments/      # Investment components
│   ├── loans/           # Loan module components
│   ├── payroll/         # Payroll components
│   ├── subscriptions/   # Subscription components
│   ├── upload/          # Upload components
│   └── vendors/         # Vendor components
│
├── lib/                  # Utilities and services
│   ├── services/        # Business logic
│   │   ├── openai.ts           # OpenAI integration
│   │   ├── expense-analyzer.ts # Expense analysis
│   │   ├── subscription-analyzer.ts # Subscription analysis
│   │   ├── budget-manager.ts   # Budget management
│   │   ├── cashflow-manager.ts # Cash flow management
│   │   └── investment-analyzer.ts # Investment analysis
│   ├── db/             # Database schemas and types
│   └── utils/          # Helper functions
│       ├── formatters.ts  # Data formatting
│       └── validators.ts  # Data validation
│
├── public/             # Static assets
│   ├── images/        # Image assets
│   └── fonts/         # Font files
│
├── styles/            # Global styles
│   └── globals.css    # Global CSS
│
├── types/             # TypeScript type definitions
│   ├── expense.ts
│   ├── investment.ts
│   └── subscription.ts
│
├── config/            # Configuration files
│   └── constants.ts   # App constants
│
├── .env              # Environment variables
├── .env.example      # Environment variables example
├── .eslintrc.json    # ESLint configuration
├── .gitignore        # Git ignore rules
├── next.config.mjs   # Next.js configuration
├── package.json      # Project dependencies
├── postcss.config.js # PostCSS configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation
```

### Key Directories

1. **`/app`**: Next.js 14 app router pages
   - Each module has its own directory
   - Follows Next.js file-based routing
   - Contains page-specific logic

2. **`/components`**: Reusable React components
   - Organized by module/feature
   - UI components from shadcn/ui
   - Follows atomic design principles

3. **`/lib`**: Core business logic
   - Services for API integrations
   - Database operations
   - Utility functions
   - Type definitions

4. **`/public`**: Static assets
   - Images, icons, fonts
   - Public facing resources

5. **`/styles`**: Styling files
   - Global CSS
   - Tailwind configurations
   - Theme definitions

### Naming Conventions

- **Files**: Kebab-case for pages, PascalCase for components
- **Components**: PascalCase (e.g., `SubscriptionList.tsx`)
- **Utilities**: Camel-case (e.g., `formatCurrency.ts`)
- **Types**: PascalCase with type suffix (e.g., `UserType.ts`)

### Module Organization

Each feature module follows a similar structure:
```
module/
├── page.tsx           # Main page component
├── components/        # Module-specific components
├── types/            # Module-specific types
├── utils/            # Module-specific utilities
└── constants.ts      # Module-specific constants
```

### Best Practices

1. **Component Organization**
   - One component per file
   - Co-locate related components
   - Keep components focused and reusable

2. **State Management**
   - Use React hooks for local state
   - Implement context where needed
   - Keep state close to where it's used

3. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Maintain consistent formatting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Environment Setup

1. Copy the `.env.local.example` file to `.env.local`:   ```bash
   cp .env.local.example .env.local   ```

2. Add your OpenAI API key to `.env.local`:
   - Get your API key from [OpenAI's dashboard](https://platform.openai.com/api-keys)
   - Replace `your-api-key-here` in `.env.local` with your actual API key

⚠️ **Important Security Notes**:
- Never commit your actual API key to version control
- Keep your `.env.local` file in your `.gitignore`
- If you accidentally exposed your API key, rotate it immediately in your OpenAI dashboard
