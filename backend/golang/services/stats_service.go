package services

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"insightflow/models"

	"github.com/go-redis/redis/v8"
)

// StatsService 统计服务
type StatsService struct {
	Redis          *redis.Client
	ServiceManager *ServiceManager
}

// NewStatsService 创建统计服务
func NewStatsService(redis *redis.Client, serviceManager *ServiceManager) *StatsService {
	return &StatsService{
		Redis:          redis,
		ServiceManager: serviceManager,
	}
}

// GetDashboardStats 获取仪表盘统计数据
func (ss *StatsService) GetDashboardStats(ctx context.Context) (*models.StatsResponse, error) {
	// 生成缓存键
	currentHour := ss.ServiceManager.GetTimeService().GetCurrentTimeString()[:13]
	cacheKey := ss.ServiceManager.GetCacheService().GenerateCacheKey("dashboard_stats", currentHour)

	// 尝试从缓存获取
	cachedData, err := ss.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var stats models.StatsResponse
		if json.Unmarshal([]byte(cachedData), &stats) == nil {
			log.Printf("仪表盘统计缓存命中: %s", cacheKey)
			return &stats, nil
		}
	}

	// 缓存未命中，重新计算
	onlineUsers := ss.Redis.SCard(ctx, "online_users").Val()
	totalEvents := ss.parseRedisInt(ss.Redis.Get(ctx, "total_events").Val())
	purchases := ss.parseRedisInt(ss.Redis.Get(ctx, "events:purchase").Val())
	views := ss.parseRedisInt(ss.Redis.Get(ctx, "events:view").Val())
	clicks := ss.parseRedisInt(ss.Redis.Get(ctx, "events:click").Val())

	// 计算转化率
	var conversionRate float64
	if views > 0 {
		conversionRate = float64(purchases) / float64(views) * 100
	}

	// 获取热门页面
	hotPages, err := ss.GetHotPages(ctx, 5)
	if err != nil {
		hotPages = []models.PageStat{}
	}

	stats := &models.StatsResponse{
		OnlineUsers: onlineUsers,
		TotalEvents: totalEvents,
		EventsByType: map[string]int64{
			"view":     views,
			"click":    clicks,
			"purchase": purchases,
		},
		HotPages:       hotPages,
		ConversionRate: conversionRate,
	}

	// 缓存结果
	if statsData, err := json.Marshal(stats); err == nil {
		ss.Redis.Set(ctx, cacheKey, string(statsData), models.CacheExpireShort)
		log.Printf("仪表盘统计数据已缓存: %s", cacheKey)
	}

	return stats, nil
}

// GetHotPages 获取热门页面
func (ss *StatsService) GetHotPages(ctx context.Context, limit int64) ([]models.PageStat, error) {
	// 生成缓存键
	timeKey := ss.ServiceManager.GetTimeService().GetCurrentTimeString()[:15]
	cacheKey := ss.ServiceManager.GetCacheService().GenerateCacheKey("hot_pages_list", timeKey)

	// 尝试从缓存获取
	cachedData, err := ss.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var hotPages []models.PageStat
		if json.Unmarshal([]byte(cachedData), &hotPages) == nil {
			log.Printf("热门页面缓存命中: %s", cacheKey)
			return hotPages, nil
		}
	}

	// 缓存未命中，查询Redis排行榜
	pages := ss.Redis.ZRevRangeWithScores(ctx, "hot_pages", 0, limit-1).Val()

	var hotPages []models.PageStat
	for _, page := range pages {
		hotPages = append(hotPages, models.PageStat{
			PageURL: page.Member.(string),
			Views:   int64(page.Score),
		})
	}

	// 缓存结果
	if pagesData, err := json.Marshal(hotPages); err == nil {
		ss.Redis.Set(ctx, cacheKey, string(pagesData), 10*time.Minute)
		log.Printf("热门页面数据已缓存: %s", cacheKey)
	}

	return hotPages, nil
}

// GetOnlineUserCount 获取在线用户数
func (ss *StatsService) GetOnlineUserCount(ctx context.Context) int64 {
	return ss.Redis.SCard(ctx, "online_users").Val()
}

// GetEventStats 获取事件统计
func (ss *StatsService) GetEventStats(ctx context.Context) map[string]interface{} {
	// 生成缓存键
	timeKey := ss.ServiceManager.GetTimeService().GetCurrentTimeString()[:16]
	cacheKey := ss.ServiceManager.GetCacheService().GenerateCacheKey("event_stats", timeKey)

	// 尝试从缓存获取
	cachedData, err := ss.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var stats map[string]interface{}
		if json.Unmarshal([]byte(cachedData), &stats) == nil {
			log.Printf("事件统计缓存命中: %s", cacheKey)
			return stats
		}
	}

	// 缓存未命中，重新计算
	totalEvents := ss.parseRedisInt(ss.Redis.Get(ctx, "total_events").Val())
	clickEvents := ss.parseRedisInt(ss.Redis.Get(ctx, "events:click").Val())
	viewEvents := ss.parseRedisInt(ss.Redis.Get(ctx, "events:view").Val())
	purchaseEvents := ss.parseRedisInt(ss.Redis.Get(ctx, "events:purchase").Val())

	stats := map[string]interface{}{
		"total_events": totalEvents,
		"events_by_type": map[string]int64{
			"click":    clickEvents,
			"view":     viewEvents,
			"purchase": purchaseEvents,
		},
		"timestamp": ss.ServiceManager.GetTimeService().GetCurrentTimeString(),
	}

	// 缓存结果
	if statsData, err := json.Marshal(stats); err == nil {
		ss.Redis.Set(ctx, cacheKey, string(statsData), models.CacheExpireShort)
		log.Printf("事件统计数据已缓存: %s", cacheKey)
	}

	return stats
}

// GetConversionRate 获取转化率
func (ss *StatsService) GetConversionRate(ctx context.Context) float64 {
	purchases := ss.parseRedisInt(ss.Redis.Get(ctx, "events:purchase").Val())
	views := ss.parseRedisInt(ss.Redis.Get(ctx, "events:view").Val())

	if views > 0 {
		return float64(purchases) / float64(views) * 100
	}
	return 0.0
}

// parseRedisInt 解析Redis整数值
func (ss *StatsService) parseRedisInt(s string) int64 {
	if s == "" {
		return 0
	}
	if result, err := strconv.ParseInt(s, 10, 64); err == nil {
		return result
	}
	return 0
}
