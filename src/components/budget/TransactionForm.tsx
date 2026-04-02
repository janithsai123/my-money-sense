import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transaction } from '@/types/budget';

const SUGGESTED_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !category.trim()) return;

    onAdd({
      amount: parsedAmount,
      type,
      category: category.trim(),
      description: description.trim(),
      date,
    });
    setAmount('');
    setDescription('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'expense' ? 'bg-card text-expense shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'income' ? 'bg-card text-income shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Income
        </button>
      </div>

      <div>
        <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="mt-1 text-lg font-heading"
          required
        />
      </div>

      <div>
        <Label htmlFor="category" className="text-xs text-muted-foreground">Category</Label>
        <Input
          id="category"
          placeholder="e.g. Food, Rent..."
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="mt-1"
          required
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-xs text-muted-foreground">Description (optional)</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Add {type === 'income' ? 'Income' : 'Expense'}
      </Button>
    </form>
  );
}
