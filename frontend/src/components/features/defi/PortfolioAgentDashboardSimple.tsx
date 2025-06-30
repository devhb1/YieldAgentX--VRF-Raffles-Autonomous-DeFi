'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function PortfolioAgentDashboardSimple() {
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      console.log('🔧 Portfolio dashboard disabled for raffle-only system');
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">📊 Portfolio Dashboard (Disabled)</h1>
          <p className="text-slate-600">
            Portfolio management functionality has been disabled in favor of the simplified raffle system.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🎰</div>
            <h2 className="text-2xl font-semibold text-gray-900">Focus on Raffle</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              This application has been simplified to focus on the raffle functionality. 
              Portfolio management features are not available in this version.
            </p>
            <div className="pt-4">
              <a
                href="/raffle"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Raffle
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
