'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants, counterVariants } from '@/lib/utils/animations';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  isLoading = false,
  className,
  delay = 0,
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-[var(--color-success)]';
      case 'negative':
        return 'text-[var(--color-error)]';
      default:
        return 'text-[var(--color-text-secondary)]';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        transition={{ delay }}
        className={className}
      >
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
              {title}
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-[var(--color-gray-200)] animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-[var(--color-gray-200)] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[var(--color-gray-100)] rounded animate-pulse" />
              {description && (
                <div className="h-3 w-full bg-[var(--color-gray-100)] rounded animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ delay }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
            {title}
          </CardTitle>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 300 }}
          >
            <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <motion.div 
              variants={counterVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: delay + 0.1 }}
              className="text-2xl font-bold text-[var(--color-text-primary)]"
            >
              <AnimatedNumber value={typeof value === 'number' ? value : 0} />
              {typeof value === 'string' && value}
            </motion.div>
            
            {change !== undefined && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
                className={cn("text-xs flex items-center space-x-1", getChangeColor())}
              >
                <span className="font-medium">{getChangeIcon()}</span>
                <span>{Math.abs(change)}%</span>
                <span className="text-[var(--color-text-tertiary)]">vs last period</span>
              </motion.div>
            )}
            
            {description && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4 }}
                className="text-xs text-[var(--color-text-tertiary)] mt-2"
              >
                {description}
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 数字动画组件
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
}

function AnimatedNumber({ 
  value, 
  format = (num) => num.toLocaleString()
}: Omit<AnimatedNumberProps, 'duration'>) {
  return (
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {format(value)}
      </motion.span>
    </motion.span>
  );
} 