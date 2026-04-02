import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(162, 63%, 41%)',
  'hsl(199, 89%, 48%)',
  'hsl(43, 96%, 56%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 72%, 51%)',
  'hsl(330, 65%, 55%)',
  'hsl(120, 40%, 45%)',
  'hsl(25, 90%, 55%)',
];

interface Props {
  data: { name: string; amount: number }[];
  totalExpenses: number;
}

export function CategoryBreakdown({ data, totalExpenses }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No expense data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((cat, i) => {
          const pct = totalExpenses > 0 ? (cat.amount / totalExpenses * 100) : 0;
          return (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-sm flex-1 truncate">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
              <span className="text-sm font-medium font-heading">${cat.amount.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
