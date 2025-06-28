package middleware

import (
	"log"
	"net/http"
	"time"

	"insightflow/services"
)

// ServiceLogger 使用时间服务的日志中间件
func ServiceLogger(serviceManager *services.ServiceManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 使用时间服务获取开始时间
			startTime := serviceManager.GetTimeService().GetCurrentTimeString()
			start := time.Now()

			next.ServeHTTP(w, r)

			// 计算处理时间
			duration := time.Since(start)

			// 使用标准化的时间格式记录日志
			log.Printf("[%s] %s %s %s - %v",
				startTime[:19], // YYYY-MM-DD HH:MM:SS
				r.Method,
				r.RequestURI,
				r.RemoteAddr,
				duration,
			)
		})
	}
}

// ServiceRequestID 使用时间服务的请求ID中间件
func ServiceRequestID(serviceManager *services.ServiceManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 使用时间服务生成请求ID
			currentTime := serviceManager.GetTimeService().GetCurrentTimeString()
			// 格式：YYYY-MM-DD-HH-MM-SS-random
			requestID := currentTime[:19] + "-" + randomString(6)
			requestID = serviceManager.GetCacheService().GenerateCacheKey("req", requestID)

			w.Header().Set("X-Request-ID", requestID)
			r.Header.Set("X-Request-ID", requestID)

			next.ServeHTTP(w, r)
		})
	}
}

// ValidatedRequest 带数据验证的中间件
func ValidatedRequest(serviceManager *services.ServiceManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 基础请求头验证
			if r.Header.Get("Content-Type") == "" && r.Method == "POST" {
				log.Printf("警告: POST请求缺少Content-Type头, URL: %s", r.URL.Path)
			}

			// 检查请求时间戳（如果提供）
			if timestamp := r.Header.Get("X-Timestamp"); timestamp != "" {
				if parsedTime, err := serviceManager.GetTimeService().ParseTimeString(timestamp); err == nil {
					// 检查请求是否过期（超过1小时）
					if time.Since(parsedTime) > time.Hour {
						log.Printf("警告: 请求时间戳过期, URL: %s, 时间戳: %s", r.URL.Path, timestamp)
					}
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}
