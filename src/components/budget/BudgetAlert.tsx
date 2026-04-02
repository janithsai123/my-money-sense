import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  isOverBudget: boolean;
  totalExpenses: number;
  budgetLimit: number | null;
}

export function BudgetAlert({ isOverBudget, totalExpenses, budgetLimit }: Props) {
  if (!isOverBudget || budgetLimit === null) return null;

  const over = totalExpenses - budgetLimit;

  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-heading">Budget Exceeded!</AlertTitle>
      <AlertDescription>
        You've exceeded your ${budgetLimit.toFixed(2)} budget by ${over.toFixed(2)}. 
        Total expenses: ${totalExpenses.toFixed(2)}.
      </AlertDescription>
    </Alert>
  );
}
