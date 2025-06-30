'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatches
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ] as const;

  // Show a consistent fallback during SSR
  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-1">
        {themes.map(({ name, icon: Icon, label }) => (
          <button
            key={name}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
              name === 'system'
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 dark:text-slate-300"
            )}
            title={`Switch to ${label} theme`}
          >
            <Icon className="w-4 h-4" />
            <span className="ml-2 hidden sm:block">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-1">
      {themes.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
            theme === name
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 dark:text-slate-300"
          )}
          title={`Switch to ${label} theme`}
        >
          <Icon className="w-4 h-4" />
          <span className="ml-2 hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function ThemeToggleSimple() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatches
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    // During SSR or before mounted, use a default icon to prevent hydration mismatch
    if (!mounted) {
      return Monitor; // Default fallback
    }
    
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  const Icon = getIcon();

  // Show a consistent fallback during SSR
  if (!mounted) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors",
          "bg-slate-800/50 dark:bg-slate-900/50 hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
          "text-slate-400 dark:text-slate-300 hover:text-slate-200 dark:hover:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        )}
        title="Loading theme..."
      >
        <Monitor className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors",
        "bg-slate-800/50 dark:bg-slate-900/50 hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
        "text-slate-400 dark:text-slate-300 hover:text-slate-200 dark:hover:text-slate-100",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      )}
      title={`Current theme: ${theme}. Click to cycle themes.`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
