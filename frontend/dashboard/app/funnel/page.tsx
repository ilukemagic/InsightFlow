'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFunnelAnalysis } from '@/lib/hooks/useDashboard';
import { pageVariants, containerVariants } from '@/lib/utils/animations';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowDown, 
  Users, 
  ShoppingCart, 
  CreditCard,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

export default function FunnelAnalysisPage() {
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('default');
  const { data: funnelData, isLoading, error } = useFunnelAnalysis(selectedFunnelId);

  // 模拟漏斗数据
  const mockFunnelData = {
    funnel_id: 'default',
    total_users: 10000,
    conversion_rate: 3.4,
    steps: [
      { step: 'Page View', users: 10000, conversion_rate: 100 },
      { step: 'Product Click', users: 6500, conversion_rate: 65 },
      { step: 'Add to Cart', users: 2800, conversion_rate: 43.1 },
      { step: 'Checkout', users: 1200, conversion_rate: 42.9 },
      { step: 'Payment', users: 800, conversion_rate: 66.7 },
      { step: 'Purchase', users: 340, conversion_rate: 42.5 },
    ],
    timestamp: new Date().toISOString(),
  };

  const currentFunnelData = funnelData || mockFunnelData;

  // 计算转化率变化
  const conversionRateData = currentFunnelData.steps.map((step, index) => ({
    name: step.step,
    value: step.conversion_rate,
    color: index === 0 ? 'var(--color-success)' : 
           step.conversion_rate > 60 ? 'var(--color-success)' :
           step.conversion_rate > 40 ? 'var(--color-warning)' : 'var(--color-error)',
  }));

  // 用户数量趋势
  const userTrendData = currentFunnelData.steps.map((step) => ({
    timestamp: step.step,
    value: step.users,
    label: step.step,
  }));

  const funnelOptions = [
    { id: 'default', name: 'E-commerce Funnel', description: 'Standard purchase funnel' },
    { id: 'signup', name: 'User Signup', description: 'Registration conversion funnel' },
    { id: 'engagement', name: 'Content Engagement', description: 'Content interaction funnel' },
  ];

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
              Funnel Analysis
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Analyze user conversion paths and optimize your funnel performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedFunnelId}
              onChange={(e) => setSelectedFunnelId(e.target.value)}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {funnelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Funnel Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Users</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {currentFunnelData.total_users.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Users className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Overall Conversion</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {currentFunnelData.conversion_rate}%
                </p>
              </div>
              <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Completed</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {currentFunnelData.steps[currentFunnelData.steps.length - 1].users.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Drop-off</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {(currentFunnelData.total_users - currentFunnelData.steps[currentFunnelData.steps.length - 1].users).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-[var(--color-error)]/10 rounded-lg">
                <XCircle className="w-5 h-5 text-[var(--color-error)]" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Funnel Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
          Conversion Funnel
        </h3>
        
        <div className="space-y-4">
          {currentFunnelData.steps.map((step, index) => {
            const isFirst = index === 0;
            const previousStep = index > 0 ? currentFunnelData.steps[index - 1] : null;
            const stepConversionRate = previousStep ? (step.users / previousStep.users) * 100 : 100;
            const dropOffCount = previousStep ? previousStep.users - step.users : 0;
            
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="relative"
              >
                <div className="flex items-center space-x-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Funnel Bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {step.step}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {step.users.toLocaleString()} users
                        </span>
                        <span className={`text-sm font-medium ${
                          stepConversionRate >= 60 ? 'text-[var(--color-success)]' :
                          stepConversionRate >= 40 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'
                        }`}>
                          {stepConversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-[var(--color-gray-200)] rounded-full h-8 relative overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step.users / currentFunnelData.total_users) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {step.users.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Drop-off indicator */}
                {!isFirst && dropOffCount > 0 && (
                  <div className="ml-12 mt-2 flex items-center space-x-2 text-[var(--color-error)]">
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-sm">
                      {dropOffCount.toLocaleString()} users dropped off ({(100 - stepConversionRate).toFixed(1)}%)
                    </span>
                  </div>
                )}
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
        {/* Conversion Rate Chart */}
        <BarChart
          data={conversionRateData}
          title="Step Conversion Rates"
          height={320}
          showGrid={true}
          showValues={true}
          animated={true}
          orientation="vertical"
        />

        {/* User Flow Chart */}
        <LineChart
          data={userTrendData}
          title="User Flow Through Funnel"
          height={320}
          color="var(--color-secondary)"
          showGrid={true}
          showDots={true}
          animated={true}
        />
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Key Insights
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-success)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Payment step has the highest conversion rate at 66.7%
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingDown className="w-4 h-4 text-[var(--color-error)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Biggest drop-off occurs between Product Click and Add to Cart
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-success)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Overall conversion rate is above industry average
                </span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Recommendations
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <ShoppingCart className="w-4 h-4 text-[var(--color-primary)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Optimize product pages to improve Add to Cart conversion
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CreditCard className="w-4 h-4 text-[var(--color-primary)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Simplify checkout process to reduce abandonment
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-[var(--color-primary)] mt-0.5" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Implement retargeting campaigns for users who drop off
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-[var(--color-error)]">Error loading funnel data. Please try again.</p>
        </motion.div>
      )}
    </motion.div>
  );
} 