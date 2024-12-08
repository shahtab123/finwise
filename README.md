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

---

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


```

## License

This project is licensed under the MIT License.

---
