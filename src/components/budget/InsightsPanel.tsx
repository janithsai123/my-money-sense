import { Lightbulb } from 'lucide-react';

interface Props {
  insights: string[];
}

export function InsightsPanel({ insights }: Props) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Lightbulb className="h-5 w-5 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Add transactions to see insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((msg, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
          <Lightbulb className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{msg}</p>
        </div>
      ))}
    </div>
  );
}
