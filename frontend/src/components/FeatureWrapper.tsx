'use client';

import { ReactNode } from 'react';
import { APP_CONFIG, isFeatureEnabled } from '@/config/features';

interface FeatureWrapperProps {
  feature: string;
  section?: keyof typeof APP_CONFIG;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditional wrapper component that renders children only if a feature is enabled
 * Usage: <FeatureWrapper feature="agents" section="ai">...</FeatureWrapper>
 */
export function FeatureWrapper({
  feature,
  section,
  children,
  fallback = null
}: FeatureWrapperProps) {
  // If section is provided, check section.feature, otherwise check top-level feature
  const enabled = section
    ? isFeatureEnabled(section, feature)
    : (APP_CONFIG as any)[feature] === true;

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC for wrapping entire page components with feature checks
 */
export function withFeatureCheck<T extends object>(
  Component: React.ComponentType<T>,
  feature: string,
  section?: keyof typeof APP_CONFIG
) {
  return function FeatureCheckedComponent(props: T) {
    const enabled = section
      ? isFeatureEnabled(section, feature)
      : (APP_CONFIG as any)[feature] === true;

    if (!enabled) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Feature Disabled</h1>
            <p className="text-slate-400">
              This feature is currently disabled in the configuration.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Component to display feature status for debugging
 */
export function FeatureStatus() {
  // Permanently disabled
  return null;
}
