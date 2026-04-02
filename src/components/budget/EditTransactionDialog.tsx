import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Transaction } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  transaction: Transaction;
  onSave: (t: Transaction) => void;
}

export function EditTransactionDialog({ transaction, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !category.trim()) return;
    onSave({ ...transaction, amount: parsed, type, category: category.trim(), description: description.trim(), date });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex rounded-lg bg-muted p-1">
            <button type="button" onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-card text-expense shadow-sm' : 'text-muted-foreground'}`}>
              Expense
            </button>
            <button type="button" onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-card text-income shadow-sm' : 'text-muted-foreground'}`}>
              Income
            </button>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Amount ($)</Label>
            <Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Input value={category} onChange={e => setCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
