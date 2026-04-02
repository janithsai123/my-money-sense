import { useState } from 'react';
import { Target, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Props {
  balance: number;
  savingsGoal: number | null;
  onSetGoal: (goal: number | null) => void;
}

export function SavingsGoal({ balance, savingsGoal, onSetGoal }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savingsGoal?.toString() || '');

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (parsed > 0) onSetGoal(parsed);
    else onSetGoal(null);
    setEditing(false);
  };

  const progress = savingsGoal && savingsGoal > 0 ? Math.min((Math.max(balance, 0) / savingsGoal) * 100, 100) : 0;

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5000"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" onClick={handleSave} className="h-8">Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">Cancel</Button>
        </div>
      </div>
    );
  }

  if (savingsGoal === null) {
    return (
      <div className="text-center py-4">
        <Target className="h-5 w-5 mx-auto mb-2 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground mb-2">Set a savings goal</p>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Set Goal</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Savings Goal</span>
        <button onClick={() => { setValue(savingsGoal.toString()); setEditing(true); }} className="p-1 rounded hover:bg-muted transition-colors">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-heading font-bold text-foreground">${Math.max(balance, 0).toFixed(2)}</span>
        <span className="text-sm text-muted-foreground">/ ${savingsGoal.toFixed(2)}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% achieved</p>
    </div>
  );
}
