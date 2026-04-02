import { useState, useCallback, useMemo } from 'react';
import { Transaction, BudgetState } from '@/types/budget';

const STORAGE_KEY = 'budget-tracker-data';

function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { transactions: [], budgetLimit: null };
}

function saveState(state: BudgetState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useBudget() {
  const [state, setState] = useState<BudgetState>(loadState);

  const update = useCallback((fn: (prev: BudgetState) => BudgetState) => {
    setState(prev => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    update(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...t, id: crypto.randomUUID() }],
    }));
  }, [update]);

  const deleteTransaction = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, [update]);

  const setBudgetLimit = useCallback((limit: number | null) => {
    update(prev => ({ ...prev, budgetLimit: limit }));
  }, [update]);

  const totalIncome = useMemo(
    () => state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [state.transactions]
  );

  const totalExpenses = useMemo(
    () => state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [state.transactions]
  );

  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [state.transactions]);

  const isOverBudget = state.budgetLimit !== null && totalExpenses > state.budgetLimit;

  const insights = useMemo(() => {
    const msgs: string[] = [];
    const expenses = state.transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return msgs;

    // Top category
    if (categoryBreakdown.length > 0) {
      msgs.push(`You spend most on ${categoryBreakdown[0].name} ($${categoryBreakdown[0].amount.toFixed(2)})`);
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

    return msgs;
  }, [state.transactions, categoryBreakdown, totalIncome, totalExpenses]);

  const clearAll = useCallback(() => {
    update(() => ({ transactions: [], budgetLimit: null }));
  }, [update]);

  return {
    transactions: state.transactions,
    budgetLimit: state.budgetLimit,
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
