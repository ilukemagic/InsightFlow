'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { listItemVariants, containerVariants } from '@/lib/utils/animations';
import { 
  BarChart3, 
  Users, 
  Activity,
  Target,
  Heart
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    id: 'overview',
    title: 'Overview',
    href: '/',
    icon: BarChart3,
    description: 'Dashboard overview and key metrics',
  },
  {
    id: 'analytics',
    title: 'User Analytics',
    href: '/analytics',
    icon: Users,
    description: 'User behavior and engagement analysis',
  },
  {
    id: 'funnel',
    title: 'Funnel Analysis',
    href: '/funnel',
    icon: Target,
    description: 'Conversion funnel and drop-off analysis',
  },
  {
    id: 'health',
    title: 'System Health',
    href: '/health',
    icon: Heart,
    description: 'System performance and service monitoring',
  },
  {
    id: 'events',
    title: 'Event Tracking',
    href: '/events',
    icon: Activity,
    description: 'Real-time event monitoring and analytics',
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] backdrop-blur-lg",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo and Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex h-16 items-center px-6 border-b border-[var(--color-border)]"
        >
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                InsightFlow
              </h1>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Analytics Dashboard
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.nav 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 space-y-1 p-4 overflow-y-auto"
        >
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.id}
                variants={listItemVariants}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={cn(
                      "group relative flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm" 
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)]"
                    )}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-[var(--color-primary)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <motion.div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center",
                        isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"
                      )}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                        {item.description}
                      </div>
                    </div>

                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-5 transition-opacity duration-200"
                      initial={false}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t border-[var(--color-border)] p-4"
        >
          <div className="flex items-center space-x-3 text-xs text-[var(--color-text-tertiary)]">
            <div className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse-soft" />
            <span>System Status: Online</span>
          </div>
          <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            Version 1.0.0
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
} 