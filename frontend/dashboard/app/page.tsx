'use client';

import { motion } from 'framer-motion';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TrafficChart } from '@/components/dashboard/traffic-chart';
import { EventTypesChart } from '@/components/dashboard/event-types-chart';
import { pageVariants, containerVariants } from '@/lib/utils/animations';
import { useDashboardOverview } from '@/lib/hooks/useDashboard';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Zap,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { realtime, isLoading, hasError } = useDashboardOverview();

  // 模拟数据，实际开发中会从API获取
  const mockMetrics = [
    {
      title: "Online Users",
      value: realtime?.online_users || 1247,
      change: 12.5,
      changeType: "positive" as const,
      icon: Users,
      description: "Active users in the last 30 minutes"
    },
    {
      title: "Total Events",
      value: realtime?.total_events || 45621,
      change: 8.2,
      changeType: "positive" as const,
      icon: Activity,
      description: "Events tracked in the last 24 hours"
    },
    {
      title: "Page Views",
      value: 23456,
      change: -2.1,
      changeType: "negative" as const,
      icon: Eye,
      description: "Page views in the last 24 hours"
    },
    {
      title: "Conversion Rate",
      value: "3.4%",
      change: 0.8,
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Conversion rate from visit to purchase"
    },
    {
      title: "Click Events",
      value: 12834,
      change: 15.3,
      changeType: "positive" as const,
      icon: MousePointer,
      description: "Click events in the last 24 hours"
    },
    {
      title: "Purchases",
      value: 789,
      change: 5.7,
      changeType: "positive" as const,
      icon: ShoppingCart,
      description: "Purchase events in the last 24 hours"
    },
    {
      title: "Avg. Session",
      value: "4m 32s",
      change: 12.1,
      changeType: "positive" as const,
      icon: Clock,
      description: "Average session duration"
    },
    {
      title: "Real-time Events",
      value: realtime?.events_per_minute || 156,
      change: 23.4,
      changeType: "positive" as const,
      icon: Zap,
      description: "Events per minute right now"
    }
  ];

  if (hasError) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex items-center justify-center h-96"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-error)] mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Please try refreshing the page or check your connection.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Real-time insights and analytics for your applications
            </p>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--color-success-light)] border border-[var(--color-success)]/20"
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-[var(--color-success)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-[var(--color-success)]">
              Live Data
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {mockMetrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            description={metric.description}
            isLoading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Traffic Chart */}
        <TrafficChart />

        {/* Event Types Chart */}
        <EventTypesChart />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { event: "User Registration", time: "2 minutes ago", type: "success" },
            { event: "Purchase Completed", time: "5 minutes ago", type: "success" },
            { event: "Page View", time: "8 minutes ago", type: "info" },
            { event: "Click Event", time: "12 minutes ago", type: "info" },
            { event: "Form Submission", time: "15 minutes ago", type: "warning" }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'success' ? 'bg-[var(--color-success)]' :
                  activity.type === 'warning' ? 'bg-[var(--color-warning)]' :
                  'bg-[var(--color-primary)]'
                }`} />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {activity.event}
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {activity.time}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
