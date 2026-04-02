import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  budgetLimit: number | null;
}

export function SummaryCards({ balance, totalIncome, totalExpenses, budgetLimit }: Props) {
  const budgetUsed = budgetLimit ? (totalExpenses / budgetLimit * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Balance</span>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className={`text-2xl font-heading font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ${Math.abs(balance).toFixed(2)}
          </p>
          {balance < 0 && <span className="text-xs text-destructive">Deficit</span>}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Income</span>
            <div className="h-9 w-9 rounded-lg bg-income/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-income" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">${totalIncome.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Expenses</span>
            <div className="h-9 w-9 rounded-lg bg-expense/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-expense" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">${totalExpenses.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Budget</span>
            <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-accent-foreground" />
            </div>
          </div>
          {budgetLimit !== null ? (
            <>
              <p className="text-2xl font-heading font-bold text-foreground">${budgetLimit.toFixed(2)}</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgetUsed > 100 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1">{budgetUsed.toFixed(0)}% used</span>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not set</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
