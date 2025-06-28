package middleware

import (
	"log"
	"net/http"
	"time"
)

// Chain 中间件链管理器
type Chain struct {
	middlewares []func(http.Handler) http.Handler
}

// NewChain 创建新的中间件链
func NewChain(middlewares ...func(http.Handler) http.Handler) *Chain {
	return &Chain{middlewares: middlewares}
}

// Then 应用中间件链到最终处理器
func (c *Chain) Then(h http.Handler) http.Handler {
	for i := len(c.middlewares) - 1; i >= 0; i-- {
		h = c.middlewares[i](h)
	}
	return h
}

// Use 添加中间件到链中
func (c *Chain) Use(middleware func(http.Handler) http.Handler) *Chain {
	c.middlewares = append(c.middlewares, middleware)
	return c
}

// Logger 日志中间件
func Logger() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			next.ServeHTTP(w, r)
			log.Printf("[%s] %s %s %v", r.Method, r.RequestURI, r.RemoteAddr, time.Since(start))
		})
	}
}

// Recovery 恢复中间件，捕获panic
func Recovery() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					log.Printf("Panic recovered: %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// RequestID 为每个请求添加唯一ID
func RequestID() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestID := generateRequestID()
			w.Header().Set("X-Request-ID", requestID)
			r.Header.Set("X-Request-ID", requestID)
			next.ServeHTTP(w, r)
		})
	}
}

// generateRequestID 生成请求ID（简化版）
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(6)
}

// randomString 生成随机字符串（简化版）
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
