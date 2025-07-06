# InsightFlow Dashboard

A modern, real-time analytics dashboard built with Next.js, TypeScript, and Framer Motion, featuring Apple-inspired design.

## 🚀 Features

- **Real-time Analytics**: Live data updates with WebSocket connections
- **Apple-inspired Design**: Clean, modern UI with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modern Tech Stack**: Next.js 14, React 18, Framer Motion, SWR
- **Performance Optimized**: Efficient data fetching and caching strategies

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animation**: Framer Motion
- **Data Fetching**: SWR
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design System

### Colors

- Primary: #007AFF (Apple Blue)
- Secondary: #5856D6 (Purple)
- Success: #34C759 (Green)
- Warning: #FF9500 (Orange)
- Error: #FF3B30 (Red)

### Typography

- Primary Font: SF Pro Display / System Font Stack
- Monospace: SF Mono / Cascadia Code

### Spacing

- Uses a consistent 8px grid system
- Responsive spacing with CSS custom properties

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Dashboard Configuration
NEXT_PUBLIC_APP_NAME=InsightFlow
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 📱 Features

### Dashboard Overview

- Real-time metrics cards with animated counters
- Live data indicators
- Recent activity feed
- Responsive grid layout

### Navigation

- Smooth sidebar with animated transitions
- Active state indicators
- Icon animations on hover
- Breadcrumb navigation

### Data Visualization

- Interactive charts (placeholder for future implementation)
- Real-time data updates
- Responsive design
- Smooth animations

## 🔄 API Integration

The dashboard connects to the InsightFlow backend API:

- **Dashboard Stats**: `/bff/{clientType}/dashboard`
- **Realtime Data**: `/bff/stats/realtime`
- **User Analytics**: `/bff/user/{userId}/analytics`
- **System Health**: `/health`

## 🎭 Animations

Built with Framer Motion for smooth, performant animations:

- **Page Transitions**: Smooth entry/exit animations
- **Micro-interactions**: Hover effects, button presses
- **Loading States**: Skeleton screens and spinners
- **Data Updates**: Smooth number counters and chart animations

## 🧪 Development

### File Structure

```
frontend/dashboard/
├── app/                 # Next.js app router pages
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── layout/        # Layout components
│   └── dashboard/     # Dashboard-specific components
├── lib/               # Utilities and configurations
│   ├── api/          # API client and configuration
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
└── public/           # Static assets
```

### Code Style

- TypeScript with strict mode
- ESLint + Prettier configuration
- Consistent naming conventions
- Comprehensive type definitions

## 🚀 Deployment

Build the project:

```bash
pnpm run build
```

Start production server:

```bash
pnpm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
