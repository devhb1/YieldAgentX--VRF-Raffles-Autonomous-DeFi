import React from 'react'
import { cn } from '@/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div className={cn(
      'bg-slate-900 rounded-lg border border-slate-800',
      paddingClasses[padding],
      shadowClasses[shadow],
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('border-b border-slate-800 pb-4 mb-4', className)}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-dark-primary', className)}>
    {children}
  </h3>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn(className)}>
    {children}
  </div>
)
