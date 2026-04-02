import { useState } from 'react';
import { Wallet, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/hooks/useBudget';
import { SummaryCards } from '@/components/budget/SummaryCards';
import { TransactionForm } from '@/components/budget/TransactionForm';
import { TransactionList } from '@/components/budget/TransactionList';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { InsightsPanel } from '@/components/budget/InsightsPanel';
import { BudgetAlert } from '@/components/budget/BudgetAlert';
import { BudgetLimitSetter } from '@/components/budget/BudgetLimitSetter';
import { ExportButton } from '@/components/budget/ExportButton';
import { IncomeExpenseChart } from '@/components/budget/IncomeExpenseChart';
import { SavingsGoal } from '@/components/budget/SavingsGoal';
import { SearchFilter } from '@/components/budget/SearchFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Transaction } from '@/types/budget';
import { toast } from 'sonner';

const Index = () => {
  const {
    transactions, budgetLimit, totalIncome, totalExpenses,
    balance, categoryBreakdown, isOverBudget, insights,
    addTransaction, deleteTransaction, editTransaction, setBudgetLimit, clearAll,
  } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (t: Omit<Transaction, 'id'>) => {
    addTransaction(t);
    toast.success(`${t.type === 'income' ? 'Income' : 'Expense'} of $${t.amount.toFixed(2)} added`);
    // Check budget after adding expense
    if (t.type === 'expense' && budgetLimit !== null) {
      const newTotal = totalExpenses + t.amount;
      if (newTotal > budgetLimit) {
        toast.error(`Budget exceeded! Expenses: $${newTotal.toFixed(2)} / $${budgetLimit.toFixed(2)}`);
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast('Transaction deleted');
  };

  const handleEdit = (t: Transaction) => {
    editTransaction(t);
    toast.success('Transaction updated');
  };

  const handleSetBudget = (limit: number | null) => {
    setBudgetLimit(limit);
    if (limit !== null) {
      toast.success(`Budget set to $${limit.toFixed(2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground">BudgetIQ</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ThemeToggle />
            <BudgetLimitSetter budgetLimit={budgetLimit} onSet={handleSetBudget} />
            <ExportButton transactions={transactions} />
            {transactions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { clearAll(); toast('All data cleared'); }} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Budget Alert */}
        <BudgetAlert isOverBudget={isOverBudget} totalExpenses={totalExpenses} budgetLimit={budgetLimit} />

        {/* Summary Cards */}
        <SummaryCards balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} budgetLimit={budgetLimit} />

        {/* Income vs Expense Bar Chart */}
        {transactions.length > 0 && (
          <Card className="border-none shadow-sm animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart transactions={transactions} />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Transaction */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm onAdd={handleAdd} />
            </CardContent>
          </Card>

          {/* Center: Transaction List */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 space-y-3">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                Transactions
                <span className="text-xs font-normal text-muted-foreground">{transactions.length} entries</span>
              </CardTitle>
              <SearchFilter value={searchQuery} onChange={setSearchQuery} />
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} onDelete={handleDelete} onEdit={handleEdit} searchQuery={searchQuery} />
            </CardContent>
          </Card>

          {/* Right: Breakdown, Insights & Savings */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdown data={categoryBreakdown} totalExpenses={totalExpenses} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <InsightsPanel insights={insights} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Savings Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <SavingsGoal balance={balance} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
