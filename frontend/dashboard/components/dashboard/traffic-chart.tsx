'use client';

import { AreaChart } from '@/components/charts';
import { useTimeSeriesData } from '@/lib/hooks/useDashboard';
import { motion } from 'framer-motion';

export function TrafficChart() {
  const { data: timeSeriesData, isLoading, error } = useTimeSeriesData('24h');

  if (error) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Traffic Overview
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
          Traffic Overview
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

  return (
    <AreaChart
      data={timeSeriesData || []}
      title="Traffic Overview"
      height={280}
      color="var(--color-primary)"
      showGrid={true}
      showDots={false}
      animated={true}
      smooth={true}
      fillOpacity={0.2}
    />
  );
} 