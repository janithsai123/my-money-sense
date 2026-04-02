import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Transaction } from '@/types/budget';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!map[month]) map[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') map[month].income += t.amount;
      else map[month].expense += t.amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map(d => ({
      ...d,
      month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No data to chart yet</p>
      </div>
    );
  }

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
