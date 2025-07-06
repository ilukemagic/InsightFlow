'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserAnalytics, useDashboardStats } from '@/lib/hooks/useDashboard';
import { pageVariants, containerVariants } from '@/lib/utils/animations';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  MousePointer,
  Eye,
  Search,
  Clock,
  Filter
} from 'lucide-react';

export default function UserAnalyticsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchUserId, setSearchUserId] = useState<string>('');
  const { data: userAnalytics, isLoading: userLoading, error: userError } = useUserAnalytics(selectedUserId);
  const { data: dashboardStats } = useDashboardStats('web');

  // 模拟热门页面数据
  const hotPagesData = dashboardStats?.hot_pages?.map(page => ({
    name: page.page_url.split('/').pop() || 'Home',
    value: page.views,
    color: undefined,
  })) || [
    { name: 'Home', value: 1250, color: 'var(--color-primary)' },
    { name: 'Products', value: 890, color: 'var(--color-secondary)' },
    { name: 'About', value: 650, color: 'var(--color-success)' },
    { name: 'Contact', value: 420, color: 'var(--color-warning)' },
  ];

  // 模拟用户行为时间线数据
  const userTimelineData = userAnalytics?.events?.slice(0, 24).map((event, index) => ({
    timestamp: new Date(event.created_at || Date.now() - index * 60000).toLocaleTimeString(),
    value: Math.floor(Math.random() * 100) + 50,
    label: new Date(event.created_at || Date.now() - index * 60000).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  })) || [];

  const handleUserSearch = () => {
    if (searchUserId.trim()) {
      setSelectedUserId(searchUserId.trim());
    }
  };

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
              User Analytics
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Deep dive into user behavior and engagement patterns
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter User ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <Button onClick={handleUserSearch} className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </div>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* User Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Total Users",
            value: "12,847",
            change: 8.2,
            changeType: "positive" as const,
            icon: Users,
            description: "Active users in the last 30 days"
          },
          {
            title: "Avg Session Duration",
            value: "4m 32s",
            change: 12.1,
            changeType: "positive" as const,
            icon: Clock,
            description: "Average time spent per session"
          },
          {
            title: "Page Views",
            value: "45,321",
            change: -2.3,
            changeType: "negative" as const,
            icon: Eye,
            description: "Total page views this month"
          },
          {
            title: "Interactions",
            value: "18,945",
            change: 15.7,
            changeType: "positive" as const,
            icon: MousePointer,
            description: "Click and scroll interactions"
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {metric.value}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                    <metric.icon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${
                  metric.changeType === 'positive' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{metric.change}%</span>
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  vs last month
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Hot Pages Chart */}
        <BarChart
          data={hotPagesData}
          title="Most Visited Pages"
          height={320}
          showGrid={true}
          showValues={true}
          animated={true}
          orientation="vertical"
        />

        {/* User Activity Timeline */}
        {selectedUserId && userTimelineData.length > 0 && (
          <LineChart
            data={userTimelineData}
            title={`User Activity Timeline (${selectedUserId})`}
            height={320}
            color="var(--color-secondary)"
            showGrid={true}
            showDots={true}
            animated={true}
          />
        )}

        {(!selectedUserId || userTimelineData.length === 0) && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              User Activity Timeline
            </h3>
            <div className="h-64 bg-[var(--color-gray-50)] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)]">
                  Enter a User ID to view their activity timeline
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Details Panel */}
      {selectedUserId && userAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
            User Details: {selectedUserId}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total Events:</span>
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {userAnalytics.summary.total_events}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Session Duration:</span>
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {Math.round(userAnalytics.summary.session_duration / 60)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">First Visit:</span>
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {userAnalytics.summary.first_visit 
                      ? new Date(userAnalytics.summary.first_visit * 1000).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Event Types
              </h4>
              <div className="space-y-2">
                {Object.entries(userAnalytics.summary.event_types).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)] capitalize">{type}:</span>
                    <span className="text-[var(--color-text-primary)] font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Top Pages
              </h4>
              <div className="space-y-2">
                {Object.entries(userAnalytics.summary.most_visited_pages).slice(0, 5).map(([page, count]) => (
                  <div key={page} className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)] truncate max-w-[120px]" title={page}>
                      {page.split('/').pop() || 'Home'}
                    </span>
                    <span className="text-[var(--color-text-primary)] font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading and Error States */}
      {userLoading && selectedUserId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {userError && selectedUserId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-[var(--color-error)]">Error loading user data. Please try again.</p>
        </motion.div>
      )}
    </motion.div>
  );
} 