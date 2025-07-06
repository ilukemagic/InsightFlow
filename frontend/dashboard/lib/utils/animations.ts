import type { Variants, Transition } from 'framer-motion';

// 苹果风格的缓动函数
export const APPLE_EASING = [0.25, 0.46, 0.45, 0.94] as const;
export const APPLE_SPRING = {
  type: "spring",
  damping: 25,
  stiffness: 300,
} as const;

// 基础过渡配置
export const transitions: Record<string, Transition> = {
  smooth: {
    duration: 0.3,
    ease: APPLE_EASING,
  },
  fast: {
    duration: 0.15,
    ease: APPLE_EASING,
  },
  slow: {
    duration: 0.5,
    ease: APPLE_EASING,
  },
  spring: APPLE_SPRING,
  bounce: {
    type: "spring",
    damping: 10,
    stiffness: 100,
  },
};

// 页面动画变体
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// 卡片动画变体
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// 模态框动画变体
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
};

// 列表项动画变体
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
  hover: {
    x: 4,
    transition: transitions.fast,
  },
};

// 淡入动画变体
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// 缩放动画变体
export const scaleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: transitions.fast,
  },
};

// 滑动动画变体
export const slideVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: '0%',
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transitions.fast,
  },
};

// 数字计数动画
export const counterVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      ...transitions.spring,
      delay: 0.2,
    },
  },
};

// 图表动画变体
export const chartVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" },
      opacity: { duration: 0.3 },
    },
  },
};

// 容器动画变体（用于stagger动画）
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// 浮动动画变体
export const floatVariants: Variants = {
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// 脉冲动画变体
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// 摇摆动画变体
export const shakeVariants: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// 工具函数：创建延迟动画
export const createDelayedVariants = (delay: number): Variants => ({
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.smooth,
      delay,
    },
  },
});

// 工具函数：创建方向性滑动动画
export const createSlideVariants = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
  const directionMap = {
    left: { x: '-100%', y: 0 },
    right: { x: '100%', y: 0 },
    up: { x: 0, y: '-100%' },
    down: { x: 0, y: '100%' },
  };

  const initial = directionMap[direction];

  return {
    initial: {
      ...initial,
      opacity: 0,
    },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      ...initial,
      opacity: 0,
      transition: transitions.fast,
    },
  };
};

// 工具函数：创建Stagger容器
export const createStaggerContainer = (delayChildren = 0.1): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: delayChildren * 0.5,
      staggerDirection: -1,
    },
  },
}); 