'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TimeSeriesData } from '@/lib/types';

interface AreaChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
  showDots?: boolean;
  animated?: boolean;
  smooth?: boolean;
  fillOpacity?: number;
}

export function AreaChart({ 
  data, 
  title, 
  height = 250, 
  color = 'var(--color-primary)', 
  className = '',
  showGrid = true,
  showDots = false,
  animated = true,
  smooth = true,
  fillOpacity = 0.3
}: AreaChartProps) {
  // 计算图表尺寸和比例
  const { width, chartData, maxValue } = useMemo(() => {
    const chartWidth = 600;
    const chartHeight = height;
    const padding = 40;
    
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
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
    };
  }, [data, height]);

  // 生成路径字符串
  const { pathString, fillPath } = useMemo(() => {
    if (chartData.length === 0) return { pathString: '', fillPath: '' };
    
    let path = '';
    
    if (smooth) {
      // 使用贝塞尔曲线创建平滑路径
      path = `M ${chartData[0].x} ${chartData[0].y}`;
      
      for (let i = 1; i < chartData.length; i++) {
        const prevPoint = chartData[i - 1];
        const currentPoint = chartData[i];
        
        // 计算控制点
        const controlPointX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
        const controlPointY = prevPoint.y;
        const controlPointX2 = currentPoint.x - (currentPoint.x - prevPoint.x) * 0.5;
        const controlPointY2 = currentPoint.y;
        
        path += ` C ${controlPointX} ${controlPointY} ${controlPointX2} ${controlPointY2} ${currentPoint.x} ${currentPoint.y}`;
      }
    } else {
      // 使用直线连接
      path = chartData.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x} ${point.y}`;
      }, '');
    }
    
    // 创建填充路径
    const lastPoint = chartData[chartData.length - 1];
    const firstPoint = chartData[0];
    const fillPath = `${path} L ${lastPoint.x} ${height - 40} L ${firstPoint.x} ${height - 40} Z`;
    
    return { pathString: path.trim(), fillPath };
  }, [chartData, height, smooth]);

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
        value: Math.round(maxValue * (1 - i / gridCount)),
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
  }, [showGrid, height, width, data.length, maxValue]);

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
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
            
            {/* 定义阴影滤镜 */}
            <filter id="areaShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={color} floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* 网格线 */}
          {gridLines.map((line) => (
            <g key={line.key}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeOpacity={0.3}
              />
              {line.value !== undefined && (
                <text
                  x={25}
                  y={line.y1 + 5}
                  textAnchor="end"
                  className="text-xs fill-[var(--color-text-secondary)]"
                >
                  {line.value}
                </text>
              )}
            </g>
          ))}
          
          {/* 填充区域 */}
          {animated ? (
            <motion.path
              d={fillPath}
              fill="url(#areaGradient)"
              filter="url(#areaShadow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          ) : (
            <path
              d={fillPath}
              fill="url(#areaGradient)"
              filter="url(#areaShadow)"
            />
          )}
          
          {/* 边界线 */}
          {animated ? (
            <motion.path
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          ) : (
            <path
              d={pathString}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* 数据点 */}
          {showDots && chartData.map((point, index) => (
            <g key={index}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={3}
                fill="var(--color-surface)"
                stroke={color}
                strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: animated ? index * 0.05 + 1 : 0 }}
                className="cursor-pointer"
              />
              {/* 悬停效果 */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill={color}
                fillOpacity={0.2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: animated ? index * 0.05 + 1.2 : 0 }}
                className="cursor-pointer hover:opacity-60 transition-opacity"
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </motion.circle>
            </g>
          ))}
          
          {/* X轴标签 */}
          {chartData.map((point, index) => {
            if (index % Math.ceil(chartData.length / 8) === 0) {
              return (
                <text
                  key={index}
                  x={point.x}
                  y={height - 15}
                  textAnchor="middle"
                  className="text-xs fill-[var(--color-text-secondary)]"
                >
                  {point.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
} 