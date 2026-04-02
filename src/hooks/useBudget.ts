import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useBudget() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimitState] = useState<number | null>(null);
  const [savingsGoal, setSavingsGoalState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgetLimitState(null);
      setSavingsGoalState(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (txError) {
        console.error('Error loading transactions:', txError);
        toast.error('Failed to load transactions');
      } else {
        setTransactions(
          (txData || []).map(t => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type as 'income' | 'expense',
            category: t.category,
            description: t.description || '',
            date: t.date,
          }))
        );
      }

      // Fetch budget settings
      const { data: budgetData } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (budgetData) {
        setBudgetLimitState(budgetData.budget_limit ? Number(budgetData.budget_limit) : null);
        setSavingsGoalState(budgetData.savings_goal ? Number(budgetData.savings_goal) : null);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      return;
    }

    const newTx: Transaction = {
      id: data.id,
      amount: Number(data.amount),
      type: data.type as 'income' | 'expense',
      category: data.category,
      description: data.description || '',
      date: data.date,
    };
    setTransactions(prev => [newTx, ...prev]);
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [user]);

  const editTransaction = useCallback(async (updated: Transaction) => {
    if (!user) return;
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: updated.amount,
        type: updated.type,
        category: updated.category,
        description: updated.description,
        date: updated.date,
      })
      .eq('id', updated.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      return;
    }
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, [user]);

  const upsertBudgetSettings = useCallback(async (budgetLimit: number | null, savingsGoal: number | null) => {
    if (!user) return;
    const { error } = await supabase
      .from('budget_settings')
      .upsert({
        user_id: user.id,
        budget_limit: budgetLimit,
        savings_goal: savingsGoal,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving budget settings:', error);
      toast.error('Failed to save settings');
    }
  }, [user]);

  const setBudgetLimit = useCallback(async (limit: number | null) => {
    setBudgetLimitState(limit);
    await upsertBudgetSettings(limit, savingsGoal);
  }, [upsertBudgetSettings, savingsGoal]);

  const setSavingsGoal = useCallback(async (goal: number | null) => {
    setSavingsGoalState(goal);
    await upsertBudgetSettings(budgetLimit, goal);
  }, [upsertBudgetSettings, budgetLimit]);

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

    if (categoryBreakdown.length > 0 && totalExpenses > 0) {
      const top = categoryBreakdown[0];
      const pct = ((top.amount / totalExpenses) * 100).toFixed(0);
      msgs.push(`You spend ${pct}% on ${top.name} ($${top.amount.toFixed(2)})`);
    }

    const highest = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
    if (highest) {
      msgs.push(`Your highest expense is $${highest.amount.toFixed(2)} (${highest.category})`);
    }

    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0);
      if (Number(savingsRate) > 0) {
        msgs.push(`You're saving ${savingsRate}% of your income`);
      } else {
        msgs.push(`⚠ You're spending more than you earn`);
      }
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisWeek = expenses.filter(t => new Date(t.date) >= weekAgo).reduce((s, t) => s + t.amount, 0);
    const lastWeek = expenses.filter(t => {
      const d = new Date(t.date);
      return d >= twoWeeksAgo && d < weekAgo;
    }).reduce((s, t) => s + t.amount, 0);

    if (lastWeek > 0 && thisWeek > lastWeek) {
      msgs.push(`↑ Your expenses increased ${((thisWeek - lastWeek) / lastWeek * 100).toFixed(0)}% compared to last week`);
    } else if (lastWeek > 0 && thisWeek < lastWeek) {
      msgs.push(`↓ Your expenses decreased ${((lastWeek - thisWeek) / lastWeek * 100).toFixed(0)}% compared to last week`);
    }

    if (categoryBreakdown.length > 1 && totalExpenses > 0) {
      const top = categoryBreakdown[0];
      const pct = (top.amount / totalExpenses) * 100;
      if (pct > 35) {
        msgs.push(`💡 Try reducing spending in ${top.name} — it's ${pct.toFixed(0)}% of your total`);
      }
    }

    if (expenses.length >= 3) {
      const avg = totalExpenses / expenses.length;
      msgs.push(`Your average expense is $${avg.toFixed(2)}`);
    }

    if (categoryBreakdown.length > 1) {
      msgs.push(`You have expenses across ${categoryBreakdown.length} categories`);
    }

    return msgs;
  }, [transactions, categoryBreakdown, totalIncome, totalExpenses]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    // Delete all user transactions
    await supabase.from('transactions').delete().eq('user_id', user.id);
    // Reset budget settings
    await supabase.from('budget_settings').delete().eq('user_id', user.id);
    setTransactions([]);
    setBudgetLimitState(null);
    setSavingsGoalState(null);
  }, [user]);

  return {
    transactions,
    budgetLimit,
    savingsGoal,
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    isOverBudget,
    insights,
    loading,
    addTransaction,
    deleteTransaction,
    editTransaction,
    setBudgetLimit,
    setSavingsGoal,
    clearAll,
  };
}
