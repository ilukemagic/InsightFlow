'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ChartData } from '@/lib/types';

interface BarChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
  showValues?: boolean;
  animated?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export function BarChart({ 
  data, 
  title, 
  height = 300, 
  color = 'var(--color-primary)', 
  className = '',
  showGrid = true,
  showValues = true,
  animated = true,
  orientation = 'vertical'
}: BarChartProps) {
  // 计算图表尺寸和比例
  const { width, chartData, maxValue } = useMemo(() => {
    const chartWidth = 600;
    const chartHeight = height;
    const padding = 60;
    
    const max = Math.max(...data.map(d => d.value));
    const paddedMax = max * 1.1;
    
    const barWidth = orientation === 'vertical' 
      ? (chartWidth - padding * 2) / data.length * 0.8
      : (chartHeight - padding * 2) / data.length * 0.8;
    
    const chartPoints = data.map((d, i) => {
      if (orientation === 'vertical') {
        const barHeight = (d.value / paddedMax) * (chartHeight - padding * 2);
        return {
          x: padding + (i * (chartWidth - padding * 2)) / data.length + ((chartWidth - padding * 2) / data.length - barWidth) / 2,
          y: chartHeight - padding - barHeight,
          width: barWidth,
          height: barHeight,
          value: d.value,
          name: d.name,
          color: d.color || color,
          originalData: d,
        };
      } else {
        const barLength = (d.value / paddedMax) * (chartWidth - padding * 2);
        return {
          x: padding,
          y: padding + (i * (chartHeight - padding * 2)) / data.length + ((chartHeight - padding * 2) / data.length - barWidth) / 2,
          width: barLength,
          height: barWidth,
          value: d.value,
          name: d.name,
          color: d.color || color,
          originalData: d,
        };
      }
    });
    
    return {
      width: chartWidth,
      chartData: chartPoints,
      maxValue: paddedMax,
    };
  }, [data, height, color, orientation]);

  // 生成网格线
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    
    const lines = [];
    const gridCount = 5;
    
    if (orientation === 'vertical') {
      // 水平网格线
      for (let i = 0; i <= gridCount; i++) {
        const y = 60 + (i * (height - 120)) / gridCount;
        lines.push({
          type: 'horizontal',
          x1: 60,
          y1: y,
          x2: width - 60,
          y2: y,
          key: `h-${i}`,
          value: Math.round(maxValue * (1 - i / gridCount)),
        });
      }
    } else {
      // 垂直网格线
      for (let i = 0; i <= gridCount; i++) {
        const x = 60 + (i * (width - 120)) / gridCount;
        lines.push({
          type: 'vertical',
          x1: x,
          y1: 60,
          x2: x,
          y2: height - 60,
          key: `v-${i}`,
          value: Math.round(maxValue * (i / gridCount)),
        });
      }
    }
    
    return lines;
  }, [showGrid, height, width, maxValue, orientation]);

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
                  x={orientation === 'vertical' ? 45 : line.x1}
                  y={orientation === 'vertical' ? line.y1 + 5 : height - 45}
                  textAnchor={orientation === 'vertical' ? 'end' : 'middle'}
                  className="text-xs fill-[var(--color-text-secondary)]"
                >
                  {line.value}
                </text>
              )}
            </g>
          ))}
          
          {/* 柱状图 */}
          {chartData.map((bar, index) => (
            <g key={index}>
              {animated ? (
                <motion.rect
                  x={bar.x}
                  y={orientation === 'vertical' ? height - 60 : bar.y}
                  width={orientation === 'vertical' ? bar.width : 0}
                  height={orientation === 'vertical' ? 0 : bar.height}
                  fill={bar.color}
                  rx={4}
                  initial={{ 
                    [orientation === 'vertical' ? 'height' : 'width']: 0 
                  }}
                  animate={{ 
                    [orientation === 'vertical' ? 'height' : 'width']: 
                      orientation === 'vertical' ? bar.height : bar.width,
                    y: bar.y
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>{`${bar.name}: ${bar.value}`}</title>
                </motion.rect>
              ) : (
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={bar.color}
                  rx={4}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>{`${bar.name}: ${bar.value}`}</title>
                </rect>
              )}
              
              {/* 显示数值 */}
              {showValues && (
                <motion.text
                  x={orientation === 'vertical' ? 
                    bar.x + bar.width / 2 : 
                    bar.x + bar.width + 10}
                  y={orientation === 'vertical' ? 
                    bar.y - 10 : 
                    bar.y + bar.height / 2 + 5}
                  textAnchor={orientation === 'vertical' ? 'middle' : 'start'}
                  className="text-sm font-medium fill-[var(--color-text-primary)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animated ? index * 0.1 + 0.5 : 0 }}
                >
                  {bar.value}
                </motion.text>
              )}
              
              {/* 显示标签 */}
              <text
                x={orientation === 'vertical' ? 
                  bar.x + bar.width / 2 : 
                  30}
                y={orientation === 'vertical' ? 
                  height - 40 : 
                  bar.y + bar.height / 2 + 5}
                textAnchor={orientation === 'vertical' ? 'middle' : 'end'}
                className="text-xs fill-[var(--color-text-secondary)]"
              >
                {bar.name.length > 10 ? `${bar.name.substring(0, 10)}...` : bar.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
} 