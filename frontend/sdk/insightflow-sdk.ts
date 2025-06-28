/**
 * InsightFlow 用户行为分析 SDK (TypeScript版本)
 * 实现自动事件采集、批量发送、会话管理
 * 符合 FastAPI 后端接口规范
 */

// 类型定义
interface EventData {
  user_id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  element?: string;
  element_text?: string;
  timestamp: number;
  extra_data?: Record<string, any>;
}

interface BatchEventRequest {
  events: EventData[];
}

interface BatchEventResponse {
  status: string;
  message: string;
  processed_count: number;
  golang_response?: any;
}

interface SDKConfig {
  apiUrl?: string;
  batchSize?: number;
  batchTimeout?: number;
  enableAutoTrack?: boolean;
  userId?: string;
  debug?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  [key: string]: any;
}

interface ElementInfo {
  tagName?: string;
  id?: string;
  className?: string;
  text?: string;
  href?: string;
  type?: string;
}

interface ClickEventData {
  element?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  position_x: number;
  position_y: number;
  page_x: number;
  page_y: number;
}

interface ScrollEventData {
  scroll_top: number;
  scroll_height: number;
  window_height: number;
  scroll_percentage: number;
}

interface FormSubmitEventData {
  form_id?: string;
  form_action?: string;
  form_method?: string;
}

interface VisibilityEventData {
  visibility_state: string;
}

interface PurchaseEventData {
  order_id: string;
  total_amount: number;
  currency?: string;
  items?: any[];
}

interface PageViewEventData {
  page_category?: string;
  page_name?: string;
  [key: string]: any;
}

interface UserPropertiesEventData {
  [key: string]: any;
}

class InsightFlowSDK {
  private config: Required<SDKConfig>;
  private events: EventData[] = [];
  private sessionId: string;
  private batchTimer: number | null = null;
  private isInitialized: boolean = false;
  private scrollTimer: number | null = null;

  constructor(config: SDKConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || '/bff/events/batch',
      batchSize: config.batchSize || 10,
      batchTimeout: config.batchTimeout || 5000,
      enableAutoTrack: config.enableAutoTrack !== false,
      userId: config.userId || this.generateUserId(),
      debug: config.debug || false,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * 初始化SDK
   */
  private init(): void {
    if (this.isInitialized) return;
    
    this.log('InsightFlow SDK 初始化中...');
    
    // 自动事件追踪
    if (this.config.enableAutoTrack) {
      this.initAutoTracking();
    }
    
    // 页面卸载时发送剩余事件
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
    
    // 页面可见性变化追踪
    document.addEventListener('visibilitychange', () => {
      this.track('visibility_change', {
        visibility_state: document.visibilityState
      } as VisibilityEventData);
    });
    
    this.isInitialized = true;
    this.log('InsightFlow SDK 初始化完成');
    
    // 追踪页面访问
    this.track('view', {
      page_title: document.title,
      referrer: document.referrer
    });
  }

  /**
   * 初始化自动事件追踪
   */
  private initAutoTracking(): void {
    // 点击事件追踪
    document.addEventListener('click', (e: MouseEvent) => {
      this.trackClickEvent(e);
    });
    
    // 滚动事件追踪（节流）
    document.addEventListener('scroll', () => {
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }
      this.scrollTimer = window.setTimeout(() => {
        this.track('scroll', {
          scroll_top: window.pageYOffset,
          scroll_height: document.documentElement.scrollHeight,
          window_height: window.innerHeight,
          scroll_percentage: Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
        } as ScrollEventData);
      }, 1000);
    });
    
    // 表单提交追踪
    document.addEventListener('submit', (e: SubmitEvent) => {
      const target = e.target as HTMLFormElement;
      this.track('form_submit', {
        form_id: target.id || undefined,
        form_action: target.action || undefined,
        form_method: target.method || undefined
      } as FormSubmitEventData);
    });
  }

  /**
   * 追踪点击事件
   */
  private trackClickEvent(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    const elementInfo = this.getElementInfo(element);
    
    this.track('click', {
      element: elementInfo.tagName,
      element_id: elementInfo.id,
      element_class: elementInfo.className,
      element_text: elementInfo.text,
      position_x: event.clientX,
      position_y: event.clientY,
      page_x: event.pageX,
      page_y: event.pageY
    } as ClickEventData);
  }

  /**
   * 获取元素信息
   */
  private getElementInfo(element: HTMLElement): ElementInfo {
    return {
      tagName: element.tagName?.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      text: element.textContent?.trim().substring(0, 100) || undefined,
      href: (element as HTMLAnchorElement).href || undefined,
      type: (element as HTMLInputElement).type || undefined
    };
  }

  /**
   * 主要的事件追踪方法
   */
  public track(eventType: string, data: Record<string, any> = {}): void {
    const event: EventData = {
      user_id: this.config.userId,
      session_id: this.sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: Date.now(),
      extra_data: {
        page_title: document.title,
        user_agent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: screen.width,
        screen_height: screen.height,
        window_width: window.innerWidth,
        window_height: window.innerHeight,
        ...data
      }
    };

    // 处理特定字段映射
    if (data.element) {
      event.element = String(data.element);
    }
    if (data.element_text) {
      event.element_text = String(data.element_text);
    }
    
    this.events.push(event);
    this.log('事件已记录:', event);
    
    // 检查是否需要批量发送
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    } else {
      this.scheduleBatchSend();
    }
  }

  /**
   * 调度批量发送
   */
  private scheduleBatchSend(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = window.setTimeout(() => {
      this.flush();
    }, this.config.batchTimeout);
  }

  /**
   * 批量发送事件
   */
  public async flush(sync: boolean = false): Promise<void> {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const payload: BatchEventRequest = {
      events: eventsToSend
    };

    try {
      if (sync && navigator.sendBeacon) {
        // 同步发送（页面卸载时）
        navigator.sendBeacon(
          this.config.apiUrl,
          JSON.stringify(payload)
        );
        this.log(`使用 sendBeacon 发送 ${eventsToSend.length} 个事件`);
      } else {
        // 异步发送
        const response = await this.sendWithRetry(payload);
        this.log(`成功发送 ${eventsToSend.length} 个事件`, response);
      }
    } catch (error) {
      this.log('发送事件失败:', error);
      // 失败的事件重新加入队列
      this.events.unshift(...eventsToSend);
      throw error;
    }
  }

  /**
   * 带重试机制的发送方法
   */
  private async sendWithRetry(payload: BatchEventRequest, attempt: number = 1): Promise<BatchEventResponse> {
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: BatchEventResponse = await response.json();
      return result;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        this.log(`发送失败，第 ${attempt} 次重试...`, error);
        await this.delay(this.config.retryDelay * attempt);
        return this.sendWithRetry(payload, attempt + 1);
      } else {
        throw error;
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.config.userId = userId;
    localStorage.setItem('insightflow_user_id', userId);
    this.log('用户ID已设置:', userId);
  }

  /**
   * 设置自定义属性
   */
  public setUserProperties(properties: UserPropertiesEventData): void {
    this.track('user_properties', properties);
  }

  /**
   * 生成用户ID
   */
  private generateUserId(): string {
    const stored = localStorage.getItem('insightflow_user_id');
    if (stored) return stored;
    
    const userId = 'user_' + this.generateId();
    localStorage.setItem('insightflow_user_id', userId);
    return userId;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return 'session_' + this.generateId();
  }

  /**
   * 生成随机ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * 调试日志
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[InsightFlow]', ...args);
    }
  }

  /**
   * 手动追踪购买事件
   */
  public trackPurchase(orderData: PurchaseEventData): void {
    this.track('purchase', {
      order_id: orderData.order_id,
      total_amount: orderData.total_amount,
      currency: orderData.currency || 'CNY',
      items: orderData.items || []
    });
  }

  /**
   * 手动追踪页面浏览
   */
  public trackPageView(pageData: PageViewEventData = {}): void {
    this.track('view', {
      page_category: pageData.page_category,
      page_name: pageData.page_name,
      ...pageData
    });
  }

  /**
   * 获取当前配置
   */
  public getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * 获取当前会话ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * 获取当前用户ID
   */
  public getUserId(): string {
    return this.config.userId;
  }

  /**
   * 获取待发送事件数量
   */
  public getPendingEventsCount(): number {
    return this.events.length;
  }

  /**
   * 手动触发立即发送
   */
  public async send(): Promise<void> {
    await this.flush();
  }

  /**
   * 停止SDK
   */
  public destroy(): void {
    this.flush(true);
    this.isInitialized = false;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    
    this.log('InsightFlow SDK 已销毁');
  }
}

// 导出类型定义
export type {
  EventData,
  BatchEventRequest,
  BatchEventResponse,
  SDKConfig,
  ElementInfo,
  ClickEventData,
  ScrollEventData,
  FormSubmitEventData,
  VisibilityEventData,
  PurchaseEventData,
  PageViewEventData,
  UserPropertiesEventData
};

// 导出主类
export default InsightFlowSDK;

// 全局初始化（保持向后兼容）
declare global {
  interface Window {
    InsightFlow: typeof InsightFlowSDK;
    insightflow?: InsightFlowSDK;
    insightflowConfig?: SDKConfig;
  }
}

if (typeof window !== 'undefined') {
  window.InsightFlow = InsightFlowSDK;
  
  // 自动初始化（如果有配置）
  if (window.insightflowConfig) {
    window.insightflow = new InsightFlowSDK(window.insightflowConfig);
  }
} 