import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti(isOverBudget: boolean, balance: number, savingsGoalMet: boolean) {
  const lastBalancePositive = useRef(false);
  const lastGoalMet = useRef(false);

  useEffect(() => {
    // Confetti when balance becomes positive (not on initial load)
    if (balance > 0 && !lastBalancePositive.current && lastBalancePositive.current !== undefined) {
      // Skip initial
    }
    lastBalancePositive.current = balance > 0;
  }, [balance]);

  useEffect(() => {
    if (savingsGoalMet && !lastGoalMet.current) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
      });
    }
    lastGoalMet.current = savingsGoalMet;
  }, [savingsGoalMet]);
}
