'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TimeSeriesData } from '@/lib/types';

interface LineChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
  showDots?: boolean;
  animated?: boolean;
}

export function LineChart({ 
  data, 
  title, 
  height = 200, 
  color = 'var(--color-primary)', 
  className = '',
  showGrid = true,
  showDots = true,
  animated = true
}: LineChartProps) {
  // 计算图表尺寸和比例
  const { width, chartData, maxValue, minValue } = useMemo(() => {
    const chartWidth = 600;
    const chartHeight = height;
    const padding = 40;
    
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min;
    const paddedMax = max + range * 0.1;
    const paddedMin = Math.max(0, min - range * 0.1);
    
    const chartPoints = data.map((d, i) => ({
      x: padding + (i * (chartWidth - padding * 2)) / (data.length - 1),
      y: chartHeight - padding - ((d.value - paddedMin) / (paddedMax - paddedMin)) * (chartHeight - padding * 2),
      value: d.value,
      label: d.label || d.timestamp,
      originalData: d,
    }));
    
    return {
      width: chartWidth,
      chartData: chartPoints,
      maxValue: paddedMax,
      minValue: paddedMin,
    };
  }, [data, height]);

  // 生成路径字符串
  const pathString = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const path = chartData.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, '');
    
    return path.trim();
  }, [chartData]);

  // 生成渐变填充路径
  const fillPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const path = pathString;
    const lastPoint = chartData[chartData.length - 1];
    const firstPoint = chartData[0];
    
    return `${path} L ${lastPoint.x} ${height - 40} L ${firstPoint.x} ${height - 40} Z`;
  }, [pathString, chartData, height]);

  // 生成网格线
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    
    const lines = [];
    const gridCount = 5;
    
    // 水平网格线
    for (let i = 0; i <= gridCount; i++) {
      const y = 40 + (i * (height - 80)) / gridCount;
      lines.push({
        type: 'horizontal',
        x1: 40,
        y1: y,
        x2: width - 40,
        y2: y,
        key: `h-${i}`,
      });
    }
    
    // 垂直网格线
    const verticalCount = Math.min(data.length - 1, 8);
    for (let i = 0; i <= verticalCount; i++) {
      const x = 40 + (i * (width - 80)) / verticalCount;
      lines.push({
        type: 'vertical',
        x1: x,
        y1: 40,
        x2: x,
        y2: height - 40,
        key: `v-${i}`,
      });
    }
    
    return lines;
  }, [showGrid, height, width, data.length]);

  if (data.length === 0) {
    return (
      <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-48 text-[var(--color-text-secondary)]">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {title}
        </h3>
      )}
      
      <div className="relative overflow-hidden rounded-lg">
        <svg width={width} height={height} className="w-full h-auto">
          {/* 定义渐变 */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          {/* 网格线 */}
          {gridLines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          ))}
          
          {/* 填充区域 */}
          {animated ? (
            <motion.path
              d={fillPath}
              fill="url(#lineGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          ) : (
            <path
              d={fillPath}
              fill="url(#lineGradient)"
            />
          )}
          
          {/* 主线条 */}
          {animated ? (
            <motion.path
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          ) : (
            <path
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* 数据点 */}
          {showDots && chartData.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              stroke="var(--color-surface)"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: animated ? index * 0.1 : 0 }}
              className="cursor-pointer hover:r-6 transition-all duration-200"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </motion.circle>
          ))}
          
          {/* Y轴标签 */}
          <text
            x={20}
            y={50}
            textAnchor="middle"
            className="text-xs fill-[var(--color-text-secondary)]"
          >
            {Math.round(maxValue)}
          </text>
          <text
            x={20}
            y={height - 45}
            textAnchor="middle"
            className="text-xs fill-[var(--color-text-secondary)]"
          >
            {Math.round(minValue)}
          </text>
        </svg>
      </div>
    </div>
  );
} 