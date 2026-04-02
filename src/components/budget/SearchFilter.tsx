import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchFilter({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Search transactions..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-8 pl-8 pr-8 text-sm"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
