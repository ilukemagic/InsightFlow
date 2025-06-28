package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"insightflow/infrastructure"
	"insightflow/models"
	"insightflow/services"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

// EventHandler 事件处理器
type EventHandler struct {
	KafkaProducer  *infrastructure.KafkaProducer
	EventProcessor *services.EventProcessor
	Redis          *redis.Client
	ServiceManager *services.ServiceManager
}

// NewEventHandler 创建事件处理器
func NewEventHandler(kafkaProducer *infrastructure.KafkaProducer, eventProcessor *services.EventProcessor, redis *redis.Client, serviceManager *services.ServiceManager) *EventHandler {
	return &EventHandler{
		KafkaProducer:  kafkaProducer,
		EventProcessor: eventProcessor,
		Redis:          redis,
		ServiceManager: serviceManager,
	}
}

// HandleEvents 处理事件上报
func (eh *EventHandler) HandleEvents(w http.ResponseWriter, r *http.Request) {
	var req models.EventBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 验证和预处理事件
	validEvents := make([]models.UserEvent, 0, len(req.Events))
	for _, event := range req.Events {
		// 使用验证器验证事件
		if err := eh.ServiceManager.GetEventValidator().ValidateComplete(&event); err != nil {
			log.Printf("事件验证失败: %v", err)
			continue
		}

		// 使用时间服务设置时间戳（如果没有的话）
		if event.Timestamp <= 0 {
			eh.ServiceManager.GetTimeService().SetCurrentTimestamp(&event)
		}

		// 检查事件新鲜度（超过5分钟的事件丢弃）
		if !eh.ServiceManager.GetTimeService().IsEventFresh(&event, 300) {
			log.Printf("事件过期，用户: %s, 年龄: %d秒", event.UserID, eh.ServiceManager.GetTimeService().GetEventAge(&event))
			continue
		}

		validEvents = append(validEvents, event)
	}

	// 发送有效事件到Kafka
	for _, event := range validEvents {
		if err := eh.KafkaProducer.SendEvent(event); err != nil {
			log.Printf("发送事件到Kafka失败: %v", err)
			// 降级：直接处理事件
			go eh.EventProcessor.ProcessEvent(event)
		}
	}

	// 返回成功响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.EventResponse{
		Status:  "success",
		Message: "Events received",
		Count:   len(validEvents),
	})
}

// HandleOnlineUsers 处理在线用户数查询
func (eh *EventHandler) HandleOnlineUsers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 使用统计服务获取在线用户数
	count := eh.ServiceManager.GetStatsService().GetOnlineUserCount(ctx)

	response := map[string]interface{}{
		"count":     count,
		"timestamp": eh.ServiceManager.GetTimeService().GetCurrentTimeString(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleHotPages 处理热门页面查询
func (eh *EventHandler) HandleHotPages(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 使用统计服务获取热门页面（内置缓存逻辑）
	hotPages, err := eh.ServiceManager.GetStatsService().GetHotPages(ctx, 10)
	if err != nil {
		log.Printf("获取热门页面失败: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"pages":     hotPages,
		"timestamp": eh.ServiceManager.GetTimeService().GetCurrentTimeString(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleEventStats 处理事件统计查询
func (eh *EventHandler) HandleEventStats(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 使用统计服务获取事件统计
	stats := eh.ServiceManager.GetStatsService().GetEventStats(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// HandleConversionRate 处理转化率查询
func (eh *EventHandler) HandleConversionRate(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 使用统计服务获取转化率
	rate := eh.ServiceManager.GetStatsService().GetConversionRate(ctx)

	response := map[string]interface{}{
		"rate":      rate,
		"timestamp": eh.ServiceManager.GetTimeService().GetCurrentTimeString(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleDashboard 处理仪表盘数据查询
func (eh *EventHandler) HandleDashboard(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 使用统计服务获取仪表盘数据（内置缓存逻辑）
	stats, err := eh.ServiceManager.GetStatsService().GetDashboardStats(ctx)
	if err != nil {
		log.Printf("获取仪表盘统计失败: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// HandleUserEvents 处理用户事件查询
func (eh *EventHandler) HandleUserEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	// 输入验证：使用验证器验证用户ID
	if userID == "" {
		http.Error(w, "用户ID不能为空", http.StatusBadRequest)
		return
	}

	// 使用缓存服务生成缓存键（用户事件缓存1小时）
	cacheKey := eh.ServiceManager.GetCacheService().GenerateCacheKey("user_events", userID)

	// 尝试从缓存获取
	ctx := context.Background()
	cachedData, err := eh.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		log.Printf("用户事件缓存命中: %s", cacheKey)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedData))
		return
	}

	// 缓存未命中，查询数据库
	events := eh.EventProcessor.GetUserPath(userID, 100)

	response := map[string]interface{}{
		"user_id":   userID,
		"events":    events,
		"count":     len(events),
		"timestamp": eh.ServiceManager.GetTimeService().GetCurrentTimeString(),
	}

	// 序列化并缓存（1小时过期）
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Printf("序列化用户事件数据失败: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	eh.Redis.Set(ctx, cacheKey, string(responseData), models.CacheExpireMedium)
	log.Printf("用户事件数据已缓存: %s", cacheKey)

	w.Header().Set("Content-Type", "application/json")
	w.Write(responseData)
}

// HandleFunnelAnalysis 处理漏斗分析
func (eh *EventHandler) HandleFunnelAnalysis(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	funnelId := vars["funnelId"]

	// 使用缓存服务生成缓存键（漏斗分析缓存30分钟）
	timeKey := eh.ServiceManager.GetTimeService().GetCurrentTimeString()[:16] // YYYY-MM-DD HH:MM
	cacheKey := eh.ServiceManager.GetCacheService().GenerateCacheKey("funnel", funnelId, timeKey)

	// 尝试从缓存获取
	ctx := context.Background()
	cachedData, err := eh.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		log.Printf("漏斗分析缓存命中: %s", cacheKey)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedData))
		return
	}

	// 缓存未命中，重新计算
	funnel := eh.EventProcessor.CalculateFunnel()

	// 添加时间戳和漏斗ID
	response := map[string]interface{}{
		"funnel_id":       funnelId,
		"steps":           funnel.Steps,
		"total_users":     funnel.TotalUsers,
		"conversion_rate": funnel.ConversionRate,
		"timestamp":       eh.ServiceManager.GetTimeService().GetCurrentTimeString(),
		"cache_key":       cacheKey,
	}

	// 序列化并缓存（30分钟过期）
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Printf("序列化漏斗分析数据失败: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	eh.Redis.Set(ctx, cacheKey, string(responseData), 30*time.Minute)
	log.Printf("漏斗分析数据已缓存: %s", cacheKey)

	w.Header().Set("Content-Type", "application/json")
	w.Write(responseData)
}

// HandleHealth 健康检查
func (eh *EventHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	// 使用时间服务获取标准化时间
	currentTime := eh.ServiceManager.GetTimeService().GetCurrentTimeString()

	// 检查关键服务状态
	ctx := context.Background()
	var status string = "healthy"

	// 检查Redis连接
	if err := eh.Redis.Ping(ctx).Err(); err != nil {
		status = "degraded"
		log.Printf("Redis健康检查失败: %v", err)
	}

	// 构建健康检查响应
	response := models.HealthResponse{
		Status:    status,
		Timestamp: currentTime,
		Service:   "InsightFlow Data Processor",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// parseRedisInt 解析Redis整数
func parseRedisInt(s string) int64 {
	if s == "" {
		return 0
	}
	if result, err := strconv.ParseInt(s, 10, 64); err == nil {
		return result
	}
	return 0
}
