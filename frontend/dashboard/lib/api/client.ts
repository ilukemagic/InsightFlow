import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from './config';

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 请求配置类型
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// API 客户端类
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.headers = API_CONFIG.headers;
  }

  // 基础请求方法
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = config;

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          ...this.headers,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理HTTP错误
      if (!response.ok) {
        const errorMessage = this.getErrorMessage(response.status);
        throw new ApiError(response.status, errorMessage);
      }

      // 尝试解析JSON响应
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理网络错误
      if (error instanceof TypeError) {
        throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
      }

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(0, ERROR_MESSAGES.TIMEOUT_ERROR);
      }

      // 重新抛出API错误
      if (error instanceof ApiError) {
        throw error;
      }

      // 处理其他错误
      throw new ApiError(0, ERROR_MESSAGES.UNKNOWN_ERROR, error);
    }
  }

  // 获取错误消息
  private getErrorMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // GET 请求
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST 请求
  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  // PUT 请求
  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  // DELETE 请求
  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // PATCH 请求
  async patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

// 导出类型
export type { RequestConfig }; 