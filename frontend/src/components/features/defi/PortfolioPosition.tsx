'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, TrendingUp, DollarSign } from 'lucide-react';
import { FeatureWrapper } from '@/components/FeatureWrapper';

export interface PositionData {
  id: string;
  protocol: string;
  asset: string;
  balance: number;
  value: number;
  apy: number;
  risk: 'low' | 'medium' | 'high';
}

interface PortfolioPositionProps {
  position: PositionData;
  onDeposit: (id: string, amount: number) => void;
  onWithdraw: (id: string, amount: number) => void;
}

export function PortfolioPosition({ position, onDeposit, onWithdraw }: PortfolioPositionProps) {
  const [amount, setAmount] = useState<string>('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

  const handleAction = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      if (action === 'deposit') {
        onDeposit(position.id, numAmount);
      } else {
        onWithdraw(position.id, numAmount);
      }
      setAmount('');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{position.protocol}</CardTitle>
            <CardDescription>{position.asset}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Risk Level</div>
            <div className={`text-sm font-medium ${getRiskColor(position.risk)}`}>
              {position.risk.toUpperCase()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-400">Balance</div>
            <div className="text-lg font-semibold text-white">
              {position.balance.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Value</div>
            <div className="text-lg font-semibold text-blue-400">
              ${position.value.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">APY</div>
            <div className="text-lg font-semibold text-green-400">
              {position.apy.toFixed(2)}%
            </div>
          </div>
        </div>

        <FeatureWrapper feature="deposits" section="defi">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                variant={action === 'deposit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAction('deposit')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Deposit
              </Button>
              <Button
                variant={action === 'withdraw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAction('withdraw')}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-1" />
                Withdraw
              </Button>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                step="0.0001"
              />
              <Button
                onClick={handleAction}
                disabled={!amount || parseFloat(amount) <= 0}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {action === 'deposit' ? 'Deposit' : 'Withdraw'}
              </Button>
            </div>
          </div>
        </FeatureWrapper>
      </CardContent>
    </Card>
  );
}

interface PortfolioGridProps {
  positions: PositionData[];
  onDeposit: (id: string, amount: number) => void;
  onWithdraw: (id: string, amount: number) => void;
}

export function PortfolioGrid({ positions, onDeposit, onWithdraw }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {positions.map((position) => (
        <PortfolioPosition
          key={position.id}
          position={position}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
}
