/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                accent: {
                    cyan: '#06b6d4',
                    emerald: '#10b981',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                    purple: '#8b5cf6',
                },
                dark: {
                    primary: '#0f172a',   // slate-900
                    secondary: '#1e293b', // slate-800
                    tertiary: '#334155',  // slate-700
                    border: '#475569',    // slate-600
                    text: {
                        primary: '#f8fafc',   // slate-50
                        secondary: '#cbd5e1', // slate-300
                        muted: '#64748b',     // slate-500
                    }
                },
                chainlink: {
                    blue: '#375bd2',
                    light: '#4a9eff',
                    dark: '#2e4bc7',
                }
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
                'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            },
            animation: {
                'gradient': 'gradient 6s ease infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
