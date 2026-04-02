import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Transaction } from '@/types/budget';

interface Props {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: Props) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-5 w-5 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recent.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
            t.type === 'income'
              ? 'bg-emerald-500/10'
              : 'bg-rose-500/10'
          }`}>
            {t.type === 'income' ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.description || t.category}</p>
            <p className="text-xs text-muted-foreground">
              {t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span className={`text-sm font-heading font-semibold shrink-0 ${
            t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
