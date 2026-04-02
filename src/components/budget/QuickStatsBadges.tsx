import { Transaction } from '@/types/budget';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  budgetLimit: number | null;
  balance: number;
}

interface Badge {
  emoji: string;
  label: string;
  color: string;
}

export function QuickStatsBadges({ transactions, totalIncome, totalExpenses, budgetLimit, balance }: Props) {
  const badges = useMemo(() => {
    const result: Badge[] = [];
    if (transactions.length === 0) return result;

    const expenses = transactions.filter(t => t.type === 'expense');

    // Savings rate badge
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      if (savingsRate >= 30) {
        result.push({ emoji: '🏆', label: 'Top Saver', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' });
      } else if (savingsRate >= 10) {
        result.push({ emoji: '💪', label: 'Good Saver', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' });
      }
    }

    // Big spender warning
    if (budgetLimit && totalExpenses > budgetLimit) {
      result.push({ emoji: '⚠️', label: 'Over Budget', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' });
    }

    // Under budget badge
    if (budgetLimit && totalExpenses <= budgetLimit * 0.7 && expenses.length > 0) {
      result.push({ emoji: '✅', label: 'Under Budget', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' });
    }

    // Transaction count milestones
    if (transactions.length >= 20) {
      result.push({ emoji: '📊', label: 'Power Tracker', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' });
    } else if (transactions.length >= 10) {
      result.push({ emoji: '📈', label: 'Active User', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' });
    }

    // Category diversity
    const categories = new Set(expenses.map(t => t.category));
    if (categories.size >= 5) {
      result.push({ emoji: '🎯', label: 'Diverse Spender', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' });
    }

    // Positive balance
    if (balance > 0 && totalIncome > 0) {
      result.push({ emoji: '💰', label: 'In the Green', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' });
    } else if (balance < 0) {
      result.push({ emoji: '🔴', label: 'In the Red', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' });
    }

    return result.slice(0, 4);
  }, [transactions, totalIncome, totalExpenses, budgetLimit, balance]);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            border backdrop-blur-sm animate-fade-in
            hover:scale-105 transition-transform duration-200 cursor-default
            ${badge.color}
          `}
        >
          <span>{badge.emoji}</span>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
