import { useState } from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  budgetLimit: number | null;
  onSet: (limit: number | null) => void;
}

export function BudgetLimitSetter({ budgetLimit, onSet }: Props) {
  const [value, setValue] = useState(budgetLimit?.toString() || '');
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (parsed > 0) {
      onSet(parsed);
    } else {
      onSet(null);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
        <Target className="h-3.5 w-3.5" />
        {budgetLimit !== null ? `Budget: $${budgetLimit.toFixed(2)}` : 'Set Budget'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="Monthly budget"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-36 h-8 text-sm"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSave()}
      />
      <Button size="sm" onClick={handleSave} className="h-8">Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">Cancel</Button>
    </div>
  );
}
