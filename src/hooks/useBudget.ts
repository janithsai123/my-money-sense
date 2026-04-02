import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, BudgetState } from '@/types/budget';

const STORAGE_KEY = 'budget-tracker-data';

function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        budgetLimit: typeof parsed.budgetLimit === 'number' ? parsed.budgetLimit : null,
      };
    }
  } catch {
    // ignore parse errors
  }
  return { transactions: [], budgetLimit: null };
}

export function useBudget() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadState().transactions);
  const [budgetLimit, setBudgetLimitState] = useState<number | null>(() => loadState().budgetLimit);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgetLimit }));
  }, [transactions, budgetLimit]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const setBudgetLimit = useCallback((limit: number | null) => {
    setBudgetLimitState(limit);
  }, []);

  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const isOverBudget = budgetLimit !== null && totalExpenses > budgetLimit;

  const insights = useMemo(() => {
    const msgs: string[] = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return msgs;

    // Top category
    if (categoryBreakdown.length > 0) {
      msgs.push(`You spend most on ${categoryBreakdown[0].name} ($${categoryBreakdown[0].amount.toFixed(2)})`);
    }

    // Highest single expense
    const highest = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
    if (highest) {
      msgs.push(`Your highest expense is $${highest.amount.toFixed(2)} (${highest.category})`);
    }

    // Income vs expense ratio
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0);
      if (Number(savingsRate) > 0) {
        msgs.push(`You're saving ${savingsRate}% of your income`);
      } else {
        msgs.push(`You're spending more than you earn`);
      }
    }

    // Weekly trend
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisWeek = expenses.filter(t => new Date(t.date) >= weekAgo).reduce((s, t) => s + t.amount, 0);
    const lastWeek = expenses.filter(t => {
      const d = new Date(t.date);
      return d >= twoWeeksAgo && d < weekAgo;
    }).reduce((s, t) => s + t.amount, 0);

    if (lastWeek > 0 && thisWeek > lastWeek) {
      msgs.push(`Your expenses increased ${((thisWeek - lastWeek) / lastWeek * 100).toFixed(0)}% this week`);
    } else if (lastWeek > 0 && thisWeek < lastWeek) {
      msgs.push(`Your expenses decreased ${((lastWeek - thisWeek) / lastWeek * 100).toFixed(0)}% this week`);
    }

    // Average transaction
    if (expenses.length >= 3) {
      const avg = totalExpenses / expenses.length;
      msgs.push(`Your average expense is $${avg.toFixed(2)}`);
    }

    // Number of categories
    if (categoryBreakdown.length > 1) {
      msgs.push(`You have expenses across ${categoryBreakdown.length} categories`);
    }

    return msgs;
  }, [transactions, categoryBreakdown, totalIncome, totalExpenses]);

  const clearAll = useCallback(() => {
    setTransactions([]);
    setBudgetLimitState(null);
  }, []);

  return {
    transactions,
    budgetLimit,
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    isOverBudget,
    insights,
    addTransaction,
    deleteTransaction,
    setBudgetLimit,
    clearAll,
  };
}
