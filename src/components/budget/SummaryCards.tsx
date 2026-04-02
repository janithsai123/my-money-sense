import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  budgetLimit: number | null;
}

function AnimatedNumber({ value, prefix = '$', className }: { value: number; prefix?: string; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  return (
    <span className={className}>
      {prefix}{Math.abs(display).toFixed(2)}
    </span>
  );
}

export function SummaryCards({ balance, totalIncome, totalExpenses, budgetLimit }: Props) {
  const budgetUsed = budgetLimit ? (totalExpenses / budgetLimit * 100) : 0;

  const cards = [
    {
      label: 'Balance',
      value: balance,
      icon: Wallet,
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      valueColor: balance >= 0 ? 'text-blue-500' : 'text-destructive',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Income',
      value: totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-500',
      borderColor: 'border-rose-500/20',
    },
    {
      label: 'Budget',
      value: budgetLimit ?? 0,
      icon: DollarSign,
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-500',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`
              relative overflow-hidden rounded-2xl border ${card.borderColor}
              bg-card/60 backdrop-blur-xl shadow-lg
              hover:shadow-xl hover:scale-[1.02] transition-all duration-300
              group cursor-default
            `}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />

            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>

              {card.label === 'Budget' ? (
                budgetLimit !== null ? (
                  <>
                    <AnimatedNumber
                      value={budgetLimit}
                      className={`text-2xl font-heading font-bold ${card.valueColor}`}
                    />
                    <div className="mt-3 h-2 rounded-full bg-muted/50 overflow-hidden backdrop-blur-sm">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          budgetUsed > 100
                            ? 'bg-gradient-to-r from-rose-500 to-red-600'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1.5 block">{budgetUsed.toFixed(0)}% used</span>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not set</p>
                )
              ) : (
                <>
                  <AnimatedNumber
                    value={card.value}
                    className={`text-2xl font-heading font-bold ${card.valueColor}`}
                  />
                  {card.label === 'Balance' && balance < 0 && (
                    <span className="text-xs text-destructive font-medium mt-1 block">Deficit</span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
