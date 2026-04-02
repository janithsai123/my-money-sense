import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '@/types/budget';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No transactions yet</p>
        <p className="text-xs mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {sorted.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
        >
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
            t.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
          }`}>
            {t.type === 'income' ? (
              <ArrowUpRight className="h-4 w-4 text-income" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-expense" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.description || t.category}</p>
            <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString()}</p>
          </div>
          <span className={`text-sm font-heading font-semibold shrink-0 ${
            t.type === 'income' ? 'text-income' : 'text-expense'
          }`}>
            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
          </span>
          <button
            onClick={() => onDelete(t.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      ))}
    </div>
  );
}
