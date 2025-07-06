'use client';

import { motion } from 'framer-motion';
import { LineChart, PieChart } from '@/components/charts';
import { Card } from '@/components/ui/card';
import { useSystemHealth, useSystemMetrics, useTimeSeriesData } from '@/lib/hooks/useDashboard';
import { pageVariants, containerVariants } from '@/lib/utils/animations';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function SystemHealthPage() {
  const { isLoading: healthLoading } = useSystemHealth();
  const { isLoading: metricsLoading } = useSystemMetrics();
  const { data: timeSeriesData } = useTimeSeriesData('24h');

  // 模拟系统状态数据
  const systemServices = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
    { name: 'Cache (Redis)', status: 'healthy', uptime: '99.9%', responseTime: '2ms' },
    { name: 'Message Queue', status: 'warning', uptime: '98.5%', responseTime: '120ms' },
    { name: 'File Storage', status: 'healthy', uptime: '99.7%', responseTime: '80ms' },
    { name: 'Analytics Service', status: 'healthy', uptime: '99.6%', responseTime: '95ms' },
  ];

  // 模拟性能指标
  const performanceMetrics = [
    { name: 'CPU Usage', value: 65, unit: '%', status: 'warning' },
    { name: 'Memory Usage', value: 78, unit: '%', status: 'error' },
    { name: 'Disk Usage', value: 45, unit: '%', status: 'healthy' },
    { name: 'Network I/O', value: 32, unit: 'Mbps', status: 'healthy' },
  ];

  // 模拟错误统计
  const errorStats = [
    { name: '4xx Errors', value: 24, color: 'var(--color-warning)' },
    { name: '5xx Errors', value: 8, color: 'var(--color-error)' },
    { name: 'Timeouts', value: 12, color: 'var(--color-error)' },
    { name: 'Rate Limits', value: 6, color: 'var(--color-warning)' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-[var(--color-success)]';
      case 'warning':
        return 'text-[var(--color-warning)]';
      case 'error':
        return 'text-[var(--color-error)]';
      default:
        return 'text-[var(--color-text-secondary)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
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
              System Health
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Monitor system performance and service health status
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
              All Systems Operational
            </span>
          </motion.div>
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
            title: "Uptime",
            value: "99.9%",
            icon: Activity,
            color: "var(--color-success)",
            description: "Last 30 days"
          },
          {
            title: "Response Time",
            value: "45ms",
            icon: Zap,
            color: "var(--color-warning)",
            description: "Average latency"
          },
          {
            title: "Active Connections",
            value: "1,247",
            icon: Network,
            color: "var(--color-primary)",
            description: "Current connections"
          },
          {
            title: "Error Rate",
            value: "0.02%",
            icon: AlertTriangle,
            color: "var(--color-error)",
            description: "Last 24 hours"
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
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                  <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Service Status */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
          Service Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemServices.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-gray-50)] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(service.status)}>
                  {getStatusIcon(service.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {service.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {service.uptime} uptime
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {service.responseTime}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  response time
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => {
            const IconComponent = {
              'CPU Usage': Cpu,
              'Memory Usage': MemoryStick,
              'Disk Usage': HardDrive,
              'Network I/O': Network,
            }[metric.name] || Activity;
            
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke={
                          metric.status === 'healthy' ? 'var(--color-success)' :
                          metric.status === 'warning' ? 'var(--color-warning)' : 'var(--color-error)'
                        }
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - metric.value / 100) }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-[var(--color-text-primary)]" />
                  </div>
                </div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {metric.name}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* System Load Chart */}
        <LineChart
          data={timeSeriesData || []}
          title="System Load (24h)"
          height={300}
          color="var(--color-primary)"
          showGrid={true}
          showDots={false}
          animated={true}
        />

        {/* Error Distribution */}
        <PieChart
          data={errorStats}
          title="Error Distribution"
          size={300}
          showLegend={true}
          showPercentage={true}
          animated={true}
          donutMode={true}
          innerRadius={0.6}
        />
      </motion.div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
          Recent Alerts
        </h3>
        
        <div className="space-y-4">
          {[
            {
              type: 'warning',
              message: 'High memory usage on server-03',
              time: '2 minutes ago',
              service: 'API Gateway'
            },
            {
              type: 'info',
              message: 'Database backup completed successfully',
              time: '15 minutes ago',
              service: 'Database'
            },
            {
              type: 'error',
              message: 'Rate limit exceeded for API endpoint',
              time: '1 hour ago',
              service: 'API Gateway'
            },
          ].map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.8 }}
              className="flex items-center space-x-4 p-4 border border-[var(--color-border)] rounded-lg"
            >
              <div className={`${
                alert.type === 'error' ? 'text-[var(--color-error)]' :
                alert.type === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-primary)]'
              }`}>
                {alert.type === 'error' ? <XCircle className="w-5 h-5" /> :
                 alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {alert.message}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {alert.service} • {alert.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loading States */}
      {(healthLoading || metricsLoading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
} 