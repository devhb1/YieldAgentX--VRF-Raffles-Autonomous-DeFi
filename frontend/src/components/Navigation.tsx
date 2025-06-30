'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Home,
  Bot,
  PieChart,
  BarChart3,
  Zap,
  Activity,
  Ticket,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_CONFIG } from '@/config/features';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, config: ROUTE_CONFIG.dashboard },
  { name: 'Agents', href: '/agents', icon: Bot, config: ROUTE_CONFIG.agents },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, config: ROUTE_CONFIG.analytics },
  { name: 'Activity', href: '/activity', icon: Activity, config: { enabled: true } },
  { name: 'Raffle', href: '/raffle', icon: Ticket, config: { enabled: true } },
];

export function Navigation() {
  const pathname = usePathname();

  // Filter navigation items based on feature configuration
  const enabledNavigation = navigationItems.filter(item => item.config.enabled);

  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <LinkIcon className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Chainlink DeFi Agents
            </span>
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
              LIVE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {enabledNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connect */}
          <ConnectButton />
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {enabledNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
