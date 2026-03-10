import { cn } from '@/utils/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; 
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({ title, value, change, icon: Icon, className }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('bg-card rounded-2xl p-5 border border-border shadow-xs', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {change !== undefined && (
          <span className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-header-bg mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}