'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Header({ className, title, subtitle }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg px-6",
        className
      )}
    >
      {/* Left section - Title */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        {title && (
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Center section - Search */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 max-w-md mx-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="search"
            placeholder="Search dashboard..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2 text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Right section - Actions */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-2"
      >
        {/* Refresh Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-[var(--color-gray-100)]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Theme Toggle */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-[var(--color-gray-100)]"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-[var(--color-gray-100)] relative"
          >
            <Bell className="h-4 w-4" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-error)] flex items-center justify-center"
            >
              <span className="text-xs text-white font-medium">3</span>
            </motion.div>
          </Button>
        </motion.div>

        {/* Settings */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-[var(--color-gray-100)]"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* User Menu */}
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="ml-2"
        >
          <Button 
            variant="ghost" 
            className="h-9 px-3 hover:bg-[var(--color-gray-100)] space-x-2"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Admin
            </span>
          </Button>
        </motion.div>

        {/* Live indicator */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-2 ml-4 px-3 py-1.5 rounded-full bg-[var(--color-success-light)] border border-[var(--color-success)]/20"
        >
          <motion.div
            className="h-2 w-2 rounded-full bg-[var(--color-success)]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-[var(--color-success)]">
            LIVE
          </span>
        </motion.div>
      </motion.div>
    </motion.header>
  );
} 