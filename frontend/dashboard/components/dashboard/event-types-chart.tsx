'use client';

import { PieChart } from '@/components/charts';
import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { motion } from 'framer-motion';
import { ChartData } from '@/lib/types';

export function EventTypesChart() {
  const { data: dashboardData, isLoading, error } = useDashboardStats('web');

  if (error) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Event Types Distribution
        </h3>
        <div className="h-64 bg-[var(--color-gray-50)] rounded-lg flex items-center justify-center">
          <p className="text-[var(--color-error)]">
            Error loading chart data
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Event Types Distribution
        </h3>
        <div className="h-64 bg-[var(--color-gray-50)] rounded-lg flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  // 转换数据格式以适配图表
  const chartData: ChartData[] = dashboardData?.events_by_type
    ? Object.entries(dashboardData.events_by_type).map(([type, count], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
        color: [
          'var(--color-primary)',
          'var(--color-secondary)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-error)',
          'hsl(280, 70%, 50%)',
          'hsl(320, 70%, 50%)',
          'hsl(20, 70%, 50%)',
        ][index % 8],
      }))
    : [
        { name: 'Click', value: 45, color: 'var(--color-primary)' },
        { name: 'View', value: 30, color: 'var(--color-secondary)' },
        { name: 'Purchase', value: 15, color: 'var(--color-success)' },
        { name: 'Scroll', value: 10, color: 'var(--color-warning)' },
      ];

  return (
    <PieChart
      data={chartData}
      title="Event Types Distribution"
      size={280}
      showLegend={true}
      showPercentage={true}
      animated={true}
      donutMode={true}
      innerRadius={0.6}
    />
  );
} 