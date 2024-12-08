// Types for budget management
export interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
  type: 'expense' | 'income';
  icon?: string;
}

export interface MonthlyBudget {
  month: string;
  year: number;
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
}

// Helper functions
export function calculatePercentage(spent: number, budget: number): number {
  return Math.min((spent / budget) * 100, 100);
}

export function getMonthName(date: Date): string {
  return date.toLocaleString('default', { month: 'long' });
}

export function generateMockData(): MonthlyBudget {
  const currentDate = new Date();
  return {
    month: getMonthName(currentDate),
    year: currentDate.getFullYear(),
    totalBudget: 5000,
    totalSpent: 3250,
    categories: [
      {
        id: '1',
        name: 'Groceries',
        budget: 800,
        spent: 650,
        color: '#FF6B6B',
        type: 'expense'
      },
      {
        id: '2',
        name: 'Marketing',
        budget: 1200,
        spent: 800,
        color: '#4ECDC4',
        type: 'expense'
      },
      {
        id: '3',
        name: 'Travel',
        budget: 600,
        spent: 450,
        color: '#45B7D1',
        type: 'expense'
      },
      {
        id: '4',
        name: 'Office Supplies',
        budget: 400,
        spent: 200,
        color: '#96CEB4',
        type: 'expense'
      },
      {
        id: '5',
        name: 'Software',
        budget: 1000,
        spent: 850,
        color: '#FFEEAD',
        type: 'expense'
      },
      {
        id: '6',
        name: 'Utilities',
        budget: 300,
        spent: 300,
        color: '#D4A5A5',
        type: 'expense'
      }
    ]
  };
}

// Storage functions
export function saveBudget(budget: MonthlyBudget): void {
  localStorage.setItem('finwise_budget', JSON.stringify(budget));
}

export function loadBudget(): MonthlyBudget | null {
  const stored = localStorage.getItem('finwise_budget');
  return stored ? JSON.parse(stored) : null;
}

// Category management
export function addCategory(budget: MonthlyBudget, category: BudgetCategory): MonthlyBudget {
  return {
    ...budget,
    categories: [...budget.categories, category],
    totalBudget: budget.totalBudget + category.budget,
    totalSpent: budget.totalSpent + category.spent
  };
}

export function updateCategory(budget: MonthlyBudget, categoryId: string, updates: Partial<BudgetCategory>): MonthlyBudget {
  const updatedCategories = budget.categories.map(cat => 
    cat.id === categoryId ? { ...cat, ...updates } : cat
  );

  return {
    ...budget,
    categories: updatedCategories,
    totalBudget: updatedCategories.reduce((sum, cat) => sum + cat.budget, 0),
    totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spent, 0)
  };
}

export function deleteCategory(budget: MonthlyBudget, categoryId: string): MonthlyBudget {
  const updatedCategories = budget.categories.filter(cat => cat.id !== categoryId);
  
  return {
    ...budget,
    categories: updatedCategories,
    totalBudget: updatedCategories.reduce((sum, cat) => sum + cat.budget, 0),
    totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spent, 0)
  };
}

// Generate trend data
export function generateTrendData(months: number = 6) {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    data.unshift({
      month: getMonthName(date),
      budget: 5000,
      spent: Math.floor(Math.random() * 2000 + 3000) // Random spending between 3000-5000
    });
  }
  
  return data;
} 