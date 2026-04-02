import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/budget';

interface Props {
  transactions: Transaction[];
}

export function ExportButton({ transactions }: Props) {
  const exportCSV = () => {
    if (transactions.length === 0) return;
    const header = 'Date,Type,Category,Description,Amount\n';
    const rows = transactions
      .map(t => `${t.date},${t.type},${t.category},"${t.description}",${t.amount}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (transactions.length === 0) return;
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} disabled={transactions.length === 0} className="gap-1.5">
        <Download className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportJSON} disabled={transactions.length === 0} className="gap-1.5">
        <Download className="h-3.5 w-3.5" /> JSON
      </Button>
    </div>
  );
}
