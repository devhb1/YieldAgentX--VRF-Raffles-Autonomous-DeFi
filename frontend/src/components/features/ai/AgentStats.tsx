'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Activity } from 'lucide-react';

interface AgentStatsProps {
  totalAgents: number;
  activeAgents: number;
  totalPerformance: number;
  totalValue: string;
}

export function AgentStats({ totalAgents, activeAgents, totalPerformance, totalValue }: AgentStatsProps) {
  const stats = [
    {
      title: 'Total Agents',
      value: totalAgents.toString(),
      description: `${activeAgents} active`,
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'Performance',
      value: `+${totalPerformance}%`,
      description: '24h change',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Total Value',
      value: totalValue,
      description: 'Under management',
      icon: Shield,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-slate-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
