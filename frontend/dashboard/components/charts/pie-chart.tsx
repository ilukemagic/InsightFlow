'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ChartData } from '@/lib/types';

interface PieChartProps {
  data: ChartData[];
  title?: string;
  size?: number;
  className?: string;
  showLegend?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  donutMode?: boolean;
  innerRadius?: number;
}

export function PieChart({ 
  data, 
  title, 
  size = 300, 
  className = '',
  showLegend = true,
  showPercentage = true,
  animated = true,
  donutMode = false,
  innerRadius = 0.5
}: PieChartProps) {
  // 计算图表数据
  const { chartData, total, radius } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - 80) / 2;
    const innerRad = donutMode ? radius * innerRadius : 0;
    
    let currentAngle = 0;
    const chartPoints = data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // 计算路径
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = radius + radius * Math.cos(startAngleRad);
      const y1 = radius + radius * Math.sin(startAngleRad);
      const x2 = radius + radius * Math.cos(endAngleRad);
      const y2 = radius + radius * Math.sin(endAngleRad);
      
      // 内圆弧（甜甜圈模式）
      const innerX1 = radius + innerRad * Math.cos(startAngleRad);
      const innerY1 = radius + innerRad * Math.sin(startAngleRad);
      const innerX2 = radius + innerRad * Math.cos(endAngleRad);
      const innerY2 = radius + innerRad * Math.sin(endAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      let pathData;
      if (donutMode) {
        pathData = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${innerX2} ${innerY2}`,
          `A ${innerRad} ${innerRad} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
          'Z'
        ].join(' ');
      } else {
        pathData = [
          `M ${radius} ${radius}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
      }
      
      // 计算标签位置
      const labelAngle = (startAngle + endAngle) / 2;
      const labelAngleRad = (labelAngle * Math.PI) / 180;
      const labelRadius = donutMode ? (radius + innerRad) / 2 : radius * 0.7;
      const labelX = radius + labelRadius * Math.cos(labelAngleRad);
      const labelY = radius + labelRadius * Math.sin(labelAngleRad);
      
      currentAngle = endAngle;
      
      return {
        ...item,
        percentage,
        angle,
        startAngle,
        endAngle,
        pathData,
        labelX,
        labelY,
        color: item.color || `hsl(${index * 360 / data.length}, 70%, 50%)`,
      };
    });
    
    return {
      chartData: chartPoints,
      total,
      radius,
    };
  }, [data, size, donutMode, innerRadius]);

  // 默认颜色调色板
  const defaultColors = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-error)',
    'hsl(280, 70%, 50%)',
    'hsl(320, 70%, 50%)',
    'hsl(20, 70%, 50%)',
  ];

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
      
      <div className="flex items-center justify-center gap-8">
        {/* 饼图 */}
        <div className="relative">
          <svg width={size} height={size} className="overflow-visible">
            {/* 饼图切片 */}
            {chartData.map((slice, index) => (
              <g key={index}>
                {animated ? (
                  <motion.path
                    d={slice.pathData}
                    fill={slice.color || defaultColors[index % defaultColors.length]}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <title>{`${slice.name}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
                  </motion.path>
                ) : (
                  <path
                    d={slice.pathData}
                    fill={slice.color || defaultColors[index % defaultColors.length]}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <title>{`${slice.name}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
                  </path>
                )}
                
                {/* 百分比标签 */}
                {showPercentage && slice.percentage > 5 && (
                  <motion.text
                    x={slice.labelX}
                    y={slice.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: animated ? index * 0.1 + 0.5 : 0 }}
                  >
                    {slice.percentage.toFixed(1)}%
                  </motion.text>
                )}
              </g>
            ))}
            
            {/* 中心文本（甜甜圈模式） */}
            {donutMode && (
              <g>
                <text
                  x={radius}
                  y={radius - 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold fill-[var(--color-text-primary)]"
                >
                  {total}
                </text>
                <text
                  x={radius}
                  y={radius + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm fill-[var(--color-text-secondary)]"
                >
                  Total
                </text>
              </g>
            )}
          </svg>
        </div>
        
        {/* 图例 */}
        {showLegend && (
          <div className="flex flex-col space-y-2">
            {chartData.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animated ? index * 0.1 + 0.2 : 0 }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {item.value} ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 