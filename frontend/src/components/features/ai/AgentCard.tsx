'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Play, Pause, Settings, Brain } from 'lucide-react';
import { FeatureWrapper } from '@/components/FeatureWrapper';

export interface AgentData {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'stopped';
  performance: number;
  description: string;
}

interface AgentCardProps {
  agent: AgentData;
  onStatusChange: (id: string, status: AgentData['status']) => void;
  onConfigure: (id: string) => void;
}

export function AgentCard({ agent, onStatusChange, onConfigure }: AgentCardProps) {
  const toggleStatus = () => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    onStatusChange(agent.id, newStatus);
  };

  const getStatusColor = (status: AgentData['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'stopped': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'yield-optimizer': return Bot;
      case 'risk-management': return Brain;
      case 'market-analysis': return Brain;
      default: return Bot;
    }
  };

  const TypeIcon = getTypeIcon(agent.type);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TypeIcon className="w-6 h-6 text-blue-400" />
            <div>
              <CardTitle className="text-white">{agent.name}</CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </div>
          </div>
          <div className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
            {agent.status.toUpperCase()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-400">Performance</div>
            <div className="text-lg font-semibold text-green-400">
              +{agent.performance}%
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              className="border-slate-600"
            >
              {agent.status === 'active' ? 
                <Pause className="w-4 h-4" /> : 
                <Play className="w-4 h-4" />
              }
            </Button>
            <FeatureWrapper feature="devTools" section="development">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure(agent.id)}
                className="border-slate-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </FeatureWrapper>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentGridProps {
  agents: AgentData[];
  onStatusChange: (id: string, status: AgentData['status']) => void;
  onConfigure: (id: string) => void;
}

export function AgentGrid({ agents, onStatusChange, onConfigure }: AgentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onStatusChange={onStatusChange}
          onConfigure={onConfigure}
        />
      ))}
    </div>
  );
}
