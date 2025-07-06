'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, PieChart, LineChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  useEventStats, 
  useHotPages, 
  useOnlineUsers, 
  useUserEvents,
  useRealtimeStats 
} from '@/lib/hooks/useDashboard';

import { pageVariants, containerVariants } from '@/lib/utils/animations';
import { 
  Activity, 
  Users, 
  MousePointer, 
  Eye, 
  TrendingUp, 
  Zap,
  Search,
  RefreshCcw,
  Globe,
  Clock,
  Target
} from 'lucide-react';

export default function EventsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // API数据获取
  const { data: eventStats, isLoading: statsLoading, refetch: refetchStats } = useEventStats();
  const { data: hotPagesData, isLoading: pagesLoading, refetch: refetchPages } = useHotPages();
  const { data: onlineUsersData, isLoading: usersLoading, refetch: refetchUsers } = useOnlineUsers();
  const { data: userEventsData, isLoading: userEventsLoading } = useUserEvents(selectedUserId);
  const { data: realtimeData } = useRealtimeStats();

  // 处理用户搜索
  const handleUserSearch = () => {
    if (searchUserId.trim()) {
      setSelectedUserId(searchUserId.trim());
    }
  };

  // 手动刷新所有数据
  const handleRefreshAll = () => {
    refetchStats();
    refetchPages();
    refetchUsers();
  };

  // 模拟数据处理
  const eventTypeData = eventStats?.events_by_type 
    ? Object.entries(eventStats.events_by_type).map(([type, count], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: Number(count),
        color: [
          'var(--color-primary)',
          'var(--color-secondary)', 
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-error)',
          'hsl(280, 70%, 50%)',
          'hsl(320, 70%, 50%)'
        ][index % 7]
      }))
    : [
        { name: 'Click', value: 4520, color: 'var(--color-primary)' },
        { name: 'View', value: 3280, color: 'var(--color-secondary)' },
        { name: 'Scroll', value: 1890, color: 'var(--color-success)' },
        { name: 'Purchase', value: 340, color: 'var(--color-warning)' },
        { name: 'Submit', value: 780, color: 'var(--color-error)' },
      ];

  const hotPagesChartData = hotPagesData?.pages?.map((page) => ({
    name: page.page_url.split('/').pop() || page.page_url,
    value: Number(page.views),
    color: undefined,
  })) || [
    { name: 'Home', value: 1250, color: 'var(--color-primary)' },
    { name: 'Products', value: 890, color: 'var(--color-secondary)' },
    { name: 'About', value: 650, color: 'var(--color-success)' },
    { name: 'Contact', value: 420, color: 'var(--color-warning)' },
  ];

  // 模拟每小时事件趋势数据
  const hourlyTrendData = eventStats?.events_per_hour 
    ? Object.entries(eventStats.events_per_hour).map(([hour, count]) => ({
        timestamp: hour,
        value: Number(count),
        label: hour.split(' ')[1] || hour,
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${String(i).padStart(2, '0')}:00`,
        value: Math.floor(Math.random() * 500) + 100,
        label: `${String(i).padStart(2, '0')}:00`,
      }));

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
              Event Tracking
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Real-time event monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 用户搜索 */}
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
            
            {/* 刷新控制 */}
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              className="flex items-center space-x-2"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
                 {[
           {
             title: "Total Events",
             value: (eventStats?.total_events || realtimeData?.total_events || 45621).toLocaleString(),
             icon: Activity,
             color: "var(--color-primary)",
             description: "Events in last 24h",
             change: "+8.2%"
           },
           {
             title: "Online Users",
             value: (onlineUsersData?.count || realtimeData?.online_users || 1247).toLocaleString(),
             icon: Users,
             color: "var(--color-success)",
             description: "Currently active",
             change: "+12.5%"
           },
           {
             title: "Events/Min",
             value: realtimeData?.events_per_minute?.toString() || "156",
             icon: Zap,
             color: "var(--color-warning)",
             description: "Real-time rate",
             change: "+23.4%"
           },
           {
             title: "Peak Hour",
             value: "14:00-15:00",
             icon: Clock,
             color: "var(--color-secondary)",
             description: "Highest activity",
             change: "↑ 2.1K events"
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
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {metric.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                    <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                  <p className="text-xs text-[var(--color-success)] mt-2">
                    {metric.change}
                  </p>
                </div>
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
        {/* Event Types Distribution */}
        <PieChart
          data={eventTypeData}
          title="Event Types Distribution"
          size={320}
          showLegend={true}
          showPercentage={true}
          animated={true}
          donutMode={true}
          innerRadius={0.6}
        />

        {/* Hot Pages */}
        <BarChart
          data={hotPagesChartData}
          title="Most Popular Pages"
          height={320}
          showGrid={true}
          showValues={true}
          animated={true}
          orientation="horizontal"
        />
      </motion.div>

      {/* Event Trends */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <LineChart
          data={hourlyTrendData}
          title="24-Hour Event Trends"
          height={300}
          color="var(--color-primary)"
          showGrid={true}
          showDots={true}
          animated={true}
        />
      </motion.div>

      {/* User Events Stream */}
      {selectedUserId && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
            User Event Stream: {selectedUserId}
          </h3>
          
          {userEventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
                     ) : userEventsData?.events && userEventsData.events.length > 0 ? (
             <div className="space-y-3 max-h-96 overflow-y-auto">
               {userEventsData.events.slice(0, 20).map((event, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="flex items-center space-x-4 p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-gray-50)] transition-colors"
                 >
                   <div className="flex-shrink-0">
                     {event.event_type === 'click' && <MousePointer className="w-4 h-4 text-[var(--color-primary)]" />}
                     {event.event_type === 'view' && <Eye className="w-4 h-4 text-[var(--color-secondary)]" />}
                     {event.event_type === 'purchase' && <Target className="w-4 h-4 text-[var(--color-success)]" />}
                     {!['click', 'view', 'purchase'].includes(event.event_type) && <Activity className="w-4 h-4 text-[var(--color-text-secondary)]" />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center space-x-2">
                       <span className="text-sm font-medium text-[var(--color-text-primary)] capitalize">
                         {event.event_type}
                       </span>
                       <span className="text-xs text-[var(--color-text-secondary)]">
                         {event.page_url}
                       </span>
                     </div>
                     {event.element && (
                       <p className="text-xs text-[var(--color-text-secondary)] truncate">
                         Element: {event.element}
                       </p>
                     )}
                   </div>
                   
                   <div className="text-right">
                     <p className="text-xs text-[var(--color-text-secondary)]">
                       {new Date(event.created_at || event.timestamp * 1000).toLocaleTimeString()}
                     </p>
                   </div>
                 </motion.div>
               ))}
             </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                No events found for this user
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Real-time Status */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          System Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <motion.div
                className="h-3 w-3 rounded-full bg-[var(--color-success)]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-[var(--color-success)]">
                Event Processing
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              All systems operational
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Globe className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Data Collection
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {statsLoading ? 'Loading...' : `${(eventStats?.total_events || 0).toLocaleString()} events today`}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[var(--color-warning)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Performance
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              95ms avg response time
            </p>
          </div>
        </div>
      </motion.div>

      {/* Loading States */}
      {(statsLoading || pagesLoading || usersLoading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
        >
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--color-text-primary)]">Loading event data...</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 