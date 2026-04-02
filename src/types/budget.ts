export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export interface BudgetState {
  transactions: Transaction[];
  budgetLimit: number | null;
}
