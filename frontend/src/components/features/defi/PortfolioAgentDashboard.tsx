/**
 * Portfolio Agent Dashboard - Redirect Component
 * This redirects to the working PortfolioAgentDashboardSimple component
 */
'use client';

import PortfolioAgentDashboardSimple from './PortfolioAgentDashboardSimple';

interface PortfolioAgentDashboardProps {
  onDataUpdate?: (data: { portfolioValue: number; totalYield: number; activeAgents: number }) => void;
}

export default function PortfolioAgentDashboard(props: PortfolioAgentDashboardProps) {
  // Props ignored for simplified raffle-only system
  return <PortfolioAgentDashboardSimple />;
}
