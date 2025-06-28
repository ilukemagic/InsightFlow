/**
 * InsightFlow 用户行为分析 SDK
 * 实现自动事件采集、批量发送、会话管理
 */
class InsightFlowSDK {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || '/api/events',
            batchSize: config.batchSize || 10,
            batchTimeout: config.batchTimeout || 5000,
            enableAutoTrack: config.enableAutoTrack !== false,
            userId: config.userId || this.generateUserId(),
            debug: config.debug || false,
            ...config
        };
        
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.batchTimer = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * 初始化SDK
     */
    init() {
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
            });
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
    initAutoTracking() {
        // 点击事件追踪
        document.addEventListener('click', (e) => {
            this.trackClickEvent(e);
        });
        
        // 滚动事件追踪（节流）
        let scrollTimer = null;
        document.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.track('scroll', {
                    scroll_top: window.pageYOffset,
                    scroll_height: document.documentElement.scrollHeight,
                    window_height: window.innerHeight,
                    scroll_percentage: Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
                });
            }, 1000);
        });
        
        // 表单提交追踪
        document.addEventListener('submit', (e) => {
            this.track('form_submit', {
                form_id: e.target.id,
                form_action: e.target.action,
                form_method: e.target.method
            });
        });
    }
    
    /**
     * 追踪点击事件
     */
    trackClickEvent(event) {
        const element = event.target;
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
        });
    }
    
    /**
     * 获取元素信息
     */
    getElementInfo(element) {
        return {
            tagName: element.tagName?.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            text: element.textContent?.trim().substring(0, 100) || null,
            href: element.href || null,
            type: element.type || null
        };
    }
    
    /**
     * 主要的事件追踪方法
     */
    track(eventType, data = {}) {
        const event = {
            user_id: this.config.userId,
            session_id: this.sessionId,
            event_type: eventType,
            page_url: window.location.href,
            page_title: document.title,
            user_agent: navigator.userAgent,
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen_width: screen.width,
            screen_height: screen.height,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            ...data
        };
        
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
    scheduleBatchSend() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        
        this.batchTimer = setTimeout(() => {
            this.flush();
        }, this.config.batchTimeout);
    }
    
    /**
     * 批量发送事件
     */
    async flush(sync = false) {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        try {
            if (sync && navigator.sendBeacon) {
                // 同步发送（页面卸载时）
                navigator.sendBeacon(
                    this.config.apiUrl,
                    JSON.stringify({ events: eventsToSend })
                );
            } else {
                // 异步发送
                await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ events: eventsToSend }),
                    keepalive: true
                });
            }
            
            this.log(`成功发送 ${eventsToSend.length} 个事件`);
        } catch (error) {
            this.log('发送事件失败:', error);
            // 失败的事件重新加入队列
            this.events.unshift(...eventsToSend);
        }
    }
    
    /**
     * 设置用户ID
     */
    setUserId(userId) {
        this.config.userId = userId;
        this.log('用户ID已设置:', userId);
    }
    
    /**
     * 设置自定义属性
     */
    setUserProperties(properties) {
        this.track('user_properties', properties);
    }
    
    /**
     * 生成用户ID
     */
    generateUserId() {
        const stored = localStorage.getItem('insightflow_user_id');
        if (stored) return stored;
        
        const userId = 'user_' + this.generateId();
        localStorage.setItem('insightflow_user_id', userId);
        return userId;
    }
    
    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'session_' + this.generateId();
    }
    
    /**
     * 生成随机ID
     */
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    
    /**
     * 调试日志
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[InsightFlow]', ...args);
        }
    }
    
    /**
     * 手动追踪购买事件
     */
    trackPurchase(orderData) {
        this.track('purchase', {
            order_id: orderData.orderId,
            total_amount: orderData.amount,
            currency: orderData.currency || 'CNY',
            items: orderData.items || []
        });
    }
    
    /**
     * 手动追踪页面浏览
     */
    trackPageView(pageData = {}) {
        this.track('view', {
            page_category: pageData.category,
            page_name: pageData.name,
            ...pageData
        });
    }
    
    /**
     * 停止SDK
     */
    destroy() {
        this.flush(true);
        this.isInitialized = false;
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
    }
}

// 全局初始化
window.InsightFlow = InsightFlowSDK;

// 自动初始化（如果有配置）
if (window.insightflowConfig) {
    window.insightflow = new InsightFlowSDK(window.insightflowConfig);
} 