import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { Transaction } from '@/types/budget';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
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
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(162, 63%, 41%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(162, 63%, 41%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              backdropFilter: 'blur(12px)',
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="hsl(162, 63%, 41%)"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            dot={{ r: 4, fill: 'hsl(162, 63%, 41%)', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            activeDot={{ r: 6 }}
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="hsl(0, 72%, 51%)"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
            dot={{ r: 4, fill: 'hsl(0, 72%, 51%)', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            activeDot={{ r: 6 }}
            name="Expenses"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
