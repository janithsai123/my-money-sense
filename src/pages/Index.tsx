import { useState } from 'react';
import { Wallet, RotateCcw, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/hooks/useBudget';
import { useConfetti } from '@/hooks/useConfetti';
import { useAuth } from '@/contexts/AuthContext';
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
import { RecentActivity } from '@/components/budget/RecentActivity';
import { QuickStatsBadges } from '@/components/budget/QuickStatsBadges';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Transaction } from '@/types/budget';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    transactions, budgetLimit, savingsGoal, totalIncome, totalExpenses,
    balance, categoryBreakdown, isOverBudget, insights, loading,
    addTransaction, deleteTransaction, editTransaction, setBudgetLimit, setSavingsGoal, clearAll,
  } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');

  const savingsGoalMet = savingsGoal !== null && savingsGoal > 0 && balance >= savingsGoal;
  useConfetti(isOverBudget, balance, savingsGoalMet);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleAdd = async (t: Omit<Transaction, 'id'>) => {
    await addTransaction(t);
    toast.success(`${t.type === 'income' ? 'Income' : 'Expense'} of $${t.amount.toFixed(2)} added`);
    if (t.type === 'expense' && budgetLimit !== null) {
      const newTotal = totalExpenses + t.amount;
      if (newTotal > budgetLimit) {
        toast.error(`Budget exceeded! Expenses: $${newTotal.toFixed(2)} / $${budgetLimit.toFixed(2)}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    toast('Transaction deleted');
  };

  const handleEdit = async (t: Transaction) => {
    await editTransaction(t);
    toast.success('Transaction updated');
  };

  const handleSetBudget = async (limit: number | null) => {
    await setBudgetLimit(limit);
    if (limit !== null) {
      toast.success(`Budget set to $${limit.toFixed(2)}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast('Signed out');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">BudgetIQ</h1>
              <p className="text-xs text-muted-foreground">Smart Finance Tracker</p>
            </div>
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
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Budget Alert */}
        <BudgetAlert isOverBudget={isOverBudget} totalExpenses={totalExpenses} budgetLimit={budgetLimit} />

        {/* Quick Stats Badges */}
        <QuickStatsBadges
          transactions={transactions}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          budgetLimit={budgetLimit}
          balance={balance}
        />

        {/* Summary Cards */}
        <SummaryCards balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} budgetLimit={budgetLimit} />

        {/* Charts Row */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Income vs Expenses Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart transactions={transactions} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdown data={categoryBreakdown} totalExpenses={totalExpenses} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Transaction */}
          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm onAdd={handleAdd} />
            </CardContent>
          </Card>

          {/* Center: Transaction List */}
          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
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

          {/* Right: Activity, Insights & Savings */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity transactions={transactions} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <InsightsPanel insights={insights} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Savings Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <SavingsGoal balance={balance} savingsGoal={savingsGoal} onSetGoal={setSavingsGoal} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
